"use client";

import {useState, useEffect, useRef} from "react";
import {ArrowLeft, Moon, Sun, Loader2, Mail, CheckCircle, ArrowRight} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {Button} from "@/app/components/ui/Button";
import {TextInput} from "@/app/components/ui/TextInput";
import {useTheme} from "@/app/hooks/useTheme";
import {useAuth} from "@/app/hooks/useAuth";
import {useGlobalNotificationPopup} from "@/app/hooks/useGlobalNotificationPopup";

type Phase = "init" | "verify-current" | "input-new" | "verify-new" | "success";

export default function ChangeEmailPage() {
	const {theme, toggleTheme} = useTheme();
	const {user, refreshUser} = useAuth();
	const notify = useGlobalNotificationPopup();
	const router = useRouter();

	const [phase, setPhase] = useState<Phase>("init");
	const [isLoading, setIsLoading] = useState(false);
	const [pin, setPin] = useState(["", "", "", "", "", ""]);
	const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [newEmail, setNewEmail] = useState("");
	const [verificationToken, setVerificationToken] = useState("");

	useEffect(() => {
		setPin(["", "", "", "", "", ""]);
	}, [phase]);

	useEffect(() => {
		if ((phase === "verify-current" || phase === "verify-new") && pinInputRefs.current[0]) {
			pinInputRefs.current[0].focus();
		}
	}, [phase]);

	const handlePinChange = (index: number, value: string) => {
		if (!/^\d*$/.test(value)) return;

		const newPin = [...pin];
		newPin[index] = value;
		setPin(newPin);

		if (value && index < 5) {
			pinInputRefs.current[index + 1]?.focus();
		}
	};

	const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !pin[index] && index > 0) {
			pinInputRefs.current[index - 1]?.focus();
		}
	};

	const handlePinPaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
		if (pastedData.every((char) => /^\d$/.test(char))) {
			const newPin = [...pin];
			pastedData.forEach((digit, i) => {
				if (i < 6) newPin[i] = digit;
			});
			setPin(newPin);
			pinInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
		}
	};

	// --- Actions ---

	const sendPinToCurrentEmail = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/user/change-email/send-current", {method: "POST"});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message);
			
			setPhase("verify-current");
			notify.success("Đã gửi mã xác thực đến email hiện tại", "Đã gửi");
		} catch (error: any) {
			notify.error(error.message || "Không thể gửi mã", "Lỗi");
		} finally {
			setIsLoading(false);
		}
	};

	const verifyCurrentEmailPin = async () => {
		const code = pin.join("");
		if (code.length !== 6) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/user/change-email/verify-current", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({code}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message);

			setVerificationToken(data.token); // Save token for next steps
			setPhase("input-new");
			notify.success("Xác thực thành công", "Thành công");
		} catch (error: any) {
			notify.error(error.message || "Mã xác thực không đúng", "Lỗi");
		} finally {
			setIsLoading(false);
		}
	};

	const sendPinToNewEmail = async () => {
		if (!newEmail || !newEmail.includes("@")) {
			notify.warning("Vui lòng nhập email hợp lệ", "Lỗi");
			return;
		}

		if (newEmail === user?.email) {
			notify.warning("Email mới phải khác email hiện tại", "Lỗi");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/user/change-email/send-new", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({email: newEmail, token: verificationToken}), // verify permission
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message);

			setPhase("verify-new");
			notify.success(`Đã gửi mã xác thực đến ${newEmail}`, "Đã gửi");
		} catch (error: any) {
			notify.error(error.message || "Không thể gửi mã", "Lỗi");
		} finally {
			setIsLoading(false);
		}
	};

	const confirmChangeEmail = async () => {
		const code = pin.join("");
		if (code.length !== 6) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/user/change-email/confirm", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					email: newEmail,
					code,
					token: verificationToken
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message);

			await refreshUser();
			setPhase("success");
			notify.success("Đổi email thành công!", "Hoàn tất");
		} catch (error: any) {
			notify.error(error.message || "Không thể đổi email", "Lỗi");
		} finally {
			setIsLoading(false);
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
					layout
					className='w-full max-w-md'
				>
					<AnimatePresence mode="wait">
						{/* PHASE 1: INIT */}
						{phase === "init" && (
							<motion.div
								key="init"
								initial={{opacity: 0, x: -20}}
								animate={{opacity: 1, x: 0}}
								exit={{opacity: 0, x: 20}}
								transition={{duration: 0.3}}
							>
								<h1 className='text-2xl font-bold mb-2 text-center'>Đổi Email</h1>
								<p className='text-center text-black/50 dark:text-white/50 mb-8'>
									Email hiện tại: <span className="font-semibold text-black dark:text-white">{user?.email}</span>
								</p>
								<div className="bg-blue-500/10 dark:bg-blue-500/10 p-4 rounded-xl mb-6 text-sm text-blue-600 dark:text-blue-400">
									Để bảo mật, chúng tôi cần xác thực email hiện tại của bạn trước khi thay đổi.
								</div>
								<Button
									onClick={sendPinToCurrentEmail}
									className="w-full py-3"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<Loader2 className="w-5 h-5 mr-2 animate-spin" />
											Đang gửi mã...
										</>
									) : (
										"Gửi mã xác thực"
									)}
								</Button>
							</motion.div>
						)}

						{/* PHASE 2 & 4: VERIFY PIN */}
						{(phase === "verify-current" || phase === "verify-new") && (
							<motion.div
								key={phase}
								initial={{opacity: 0, x: -20}}
								animate={{opacity: 1, x: 0}}
								exit={{opacity: 0, x: 20}}
								transition={{duration: 0.3}}
								className="text-center"
							>
								<h1 className='text-2xl font-bold mb-2'>Nhập mã xác thực</h1>
								<p className='text-black/50 dark:text-white/50 mb-8'>
									Mã PIN đã được gửi đến <br />
									<span className="font-semibold text-black dark:text-white">
										{phase === "verify-current" ? user?.email : newEmail}
									</span>
								</p>

								<div className='flex justify-center gap-2 mb-8' onPaste={handlePinPaste}>
									{pin.map((digit, index) => (
										<input
											key={index}
											ref={(el) => {pinInputRefs.current[index] = el}}
											type='text'
											inputMode='numeric'
											maxLength={1}
											value={digit}
											onChange={(e) => handlePinChange(index, e.target.value)}
											onKeyDown={(e) => handlePinKeyDown(index, e)}
											disabled={isLoading}
											className='w-12 h-14 text-center text-2xl font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors'
										/>
									))}
								</div>

								<Button
									onClick={phase === "verify-current" ? verifyCurrentEmailPin : confirmChangeEmail}
									className="w-full py-3"
									disabled={isLoading || pin.join("").length !== 6}
								>
									{isLoading ? (
										<>
											<Loader2 className="w-5 h-5 mr-2 animate-spin" />
											Đang kiểm tra...
										</>
									) : (
										"Xác nhận"
									)}
								</Button>
							</motion.div>
						)}

						{/* PHASE 3: INPUT NEW EMAIL */}
						{phase === "input-new" && (
							<motion.div
								key="input-new"
								initial={{opacity: 0, x: -20}}
								animate={{opacity: 1, x: 0}}
								exit={{opacity: 0, x: 20}}
								transition={{duration: 0.3}}
							>
								<h1 className='text-2xl font-bold mb-2 text-center'>Nhập Email mới</h1>
								<p className='text-center text-black/50 dark:text-white/50 mb-8'>
									Nhập email bạn muốn chuyển sang
								</p>

								<TextInput
									label="Email mới"
									icon={Mail}
									placeholder="example@email.com"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									type="email"
									containerClassName="mb-6"
								/>

								<Button
									onClick={sendPinToNewEmail}
									className="w-full py-3"
									disabled={isLoading || !newEmail}
								>
									{isLoading ? (
										<>
											<Loader2 className="w-5 h-5 mr-2 animate-spin" />
											Đang gửi mã...
										</>
									) : (
										<>
											Tiếp tục <ArrowRight className="w-5 h-5 ml-2" />
										</>
									)}
								</Button>
							</motion.div>
						)}

						{/* PHASE 5: SUCCESS */}
						{phase === "success" && (
							<motion.div
								key="success"
								initial={{opacity: 0, scale: 0.9}}
								animate={{opacity: 1, scale: 1}}
								transition={{duration: 0.3}}
								className="text-center"
							>
								<div className='w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6'>
									<CheckCircle className='w-10 h-10 text-green-500' />
								</div>
								<h1 className='text-2xl font-bold mb-2'>Thành công!</h1>
								<p className='text-black/50 dark:text-white/50 mb-8'>
									Email của bạn đã được cập nhật.
								</p>
								<Button
									onClick={() => router.push("/profile")}
									className="w-full py-3 bg-black dark:bg-white text-white dark:text-black"
								>
									Về trang cá nhân
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</main>
		</div>
	);
}
