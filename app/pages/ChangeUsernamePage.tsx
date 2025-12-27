"use client";

import {useState, useEffect} from "react";
import {ArrowLeft, Moon, Sun, Loader2, Check, Search} from "lucide-react";
import {motion} from "framer-motion";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {Button} from "@/app/components/ui/Button";
import {TextInput} from "@/app/components/ui/TextInput";
import {useTheme} from "@/app/hooks/useTheme";
import {useAuth} from "@/app/hooks/useAuth";
import {useGlobalNotificationPopup} from "@/app/hooks/useGlobalNotificationPopup";

export default function ChangeUsernamePage() {
	const {theme, toggleTheme} = useTheme();
	const {user, refreshUser} = useAuth();
	const notify = useGlobalNotificationPopup();
	const router = useRouter();

	const [newUsername, setNewUsername] = useState("");
	const [status, setStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "updating">("idle");
	
	useEffect(() => {
		if (status === "available" || status === "unavailable") {
			setStatus("idle");
		}
	}, [newUsername]);

	const handleCheckUsername = async () => {
		if (!newUsername.trim()) {
			notify.warning("Vui lòng nhập username mới", "Thông báo");
			return;
		}

		if (newUsername.length < 3) {
			notify.warning("Username phải có ít nhất 3 ký tự", "Thông báo");
			return;
		}

		if (newUsername === user?.username) {
			notify.info("Đây là username hiện tại của bạn", "Thông báo");
			return;
		}

		setStatus("checking");
		try {
			const response = await fetch("/api/user/check-username", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({username: newUsername}),
			});
			const data = await response.json();

			if (data.available) {
				setStatus("available");
				notify.success("Username khả dụng!", "Thành công");
			} else {
				setStatus("unavailable");
				notify.error("Username đã tồn tại, vui lòng chọn tên khác", "Không khả dụng");
			}
		} catch (error) {
			setStatus("idle");
			notify.error("Lỗi khi kiểm tra username", "Lỗi");
		}
	};

	const handleUpdateUsername = async () => {
		if (status !== "available") return;

		setStatus("updating");
		try {
			const response = await fetch("/api/user/update-username", {
				method: "PUT",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({username: newUsername}),
			});
			const data = await response.json();

			if (response.ok) {
				await refreshUser();
				notify.success("Đổi username thành công!", "Thành công");
				router.push("/");
			} else {
				throw new Error(data.message || "Lỗi cập nhật");
			}
		} catch (error: any) {
			setStatus("available");
			notify.error(error.message || "Không thể cập nhật username", "Lỗi");
		}
	};

	return (
		<div className='min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300'>
			<header className='flex items-center justify-between px-4 sm:px-10 py-4 sm:py-6'>
				<Link href='/profile' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
					<ArrowLeft className='w-5 h-5' />
				</Link>
				<Button
					onClick={toggleTheme}
					className='!p-3 !bg-transparent !border-0 hover:!bg-black/5 dark:hover:!bg-white/10 !shadow-none'
				>
					{theme === "dark" ? (
						<Sun className='w-5 h-5 text-black dark:text-white' />
					) : (
						<Moon className='w-5 h-5 text-black dark:text-white' />
					)}
				</Button>
			</header>

			<main className='flex-1 flex flex-col items-center justify-center p-4 sm:p-6'>
				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					transition={{duration: 0.4}}
					className='w-full max-w-md'
				>
					<h1 className='text-2xl font-bold mb-2 text-center'>Đổi Username</h1>
					<p className='text-center text-black/50 dark:text-white/50 mb-8'>
						Username hiện tại: <span className="font-semibold text-black dark:text-white">{user?.username}</span>
					</p>

					<div className="space-y-6">
						<TextInput
							label="Username mới"
							placeholder="Nhập username mới..."
							value={newUsername}
							onChange={(e) => setNewUsername(e.target.value)}
							icon={Search}
							disabled={status === "updating"}
						/>
						
						{status === "available" || status === "updating" ? (
							<Button
								onClick={handleUpdateUsername}
								className="w-full py-3 bg-green-500 hover:bg-green-600 text-white border-none"
								disabled={status === "updating"}
							>
								{status === "updating" ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Đang cập nhật...
									</>
								) : (
									<>
										<Check className="w-5 h-5 mr-2" />
										Đổi Username
									</>
								)}
							</Button>
						) : (
							<Button
								onClick={handleCheckUsername}
								className="w-full py-3"
								disabled={status === "checking" || !newUsername.trim()}
							>
								{status === "checking" ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Đang kiểm tra...
									</>
								) : (
									"Kiểm tra tính khả dụng"
								)}
							</Button>
						)}
						
						{status === "unavailable" && (
							<p className="text-red-500 text-sm text-center">
								Username này đã có người sử dụng.
							</p>
						)}
					</div>
				</motion.div>
			</main>
		</div>
	);
}
