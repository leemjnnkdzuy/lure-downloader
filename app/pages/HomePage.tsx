"use client";

import {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {LogIn, Moon, Sun, Facebook, Video, Grid, Download, LogOut, User, ChevronDown} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

import {images} from "@/app/assets";

import {DropDownContent} from "@/app/components/ui/DropDown";
import {Overlay} from "@/app/components/ui/Overlay";
import {Button} from "@/app/components/ui/Button";
import {TextInput} from "@/app/components/ui/TextInput";
import {useTheme} from "@/app/hooks/useTheme";
import {useAuth} from "@/app/hooks/useAuth";

export default function HomePage() {
	const {theme, toggleTheme} = useTheme();
	const {user, isAuthenticated, logout, loading} = useAuth();
	const router = useRouter();
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);
	const [platform, setPlatform] = useState<"facebook" | "tiktok">("facebook");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const platforms = [
		{id: "facebook", name: "Facebook", icon: Facebook},
		{id: "tiktok", name: "TikTok", icon: Video},
	] as const;

	const currentPlatform = platforms.find((p) => p.id === platform);

	const handleLogout = async () => {
		setIsDropdownOpen(false);
		await logout();
	};

	return (
		<div className='min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300'>
			<header className='flex items-center justify-between px-4 sm:px-10 py-4 sm:py-6'>
				<div className='flex items-center gap-2 sm:gap-3'>
					<Image
						src={images.logoWhite}
						alt='Logo'
						width={40}
						height={40}
						className='w-8 h-8 sm:w-10 sm:h-10 object-contain dark:invert-0 invert'
					/>
					<span className='text-lg sm:text-xl font-bold hidden sm:inline'>Lure Downloader</span>
				</div>
				<div className='flex items-center gap-4'>
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

					{loading ? (
						<div className='w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 animate-pulse' />
					) : isAuthenticated && user ? (
						<DropDownContent
							trigger={
								<button className='flex items-center gap-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors'>
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.username}
											className='w-10 h-10 rounded-full object-cover border-2 border-black/10 dark:border-white/10'
										/>
									) : (
										<div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm'>
											{user.username?.charAt(0).toUpperCase() || "U"}
										</div>
									)}
									<ChevronDown
										className={`w-4 h-4 text-black/60 dark:text-white/60 transition-transform ${
											isDropdownOpen ? "rotate-180" : ""
										}`}
									/>
								</button>
							}
							isOpen={isDropdownOpen}
							onOpenChange={setIsDropdownOpen}
							align='right'
							className='w-64 bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10'
						>
							<div className='p-4 border-b border-black/10 dark:border-white/10'>
								<div className='flex items-center gap-3'>
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.username}
											className='w-12 h-12 rounded-full object-cover'
										/>
									) : (
										<div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
											{user.username?.charAt(0).toUpperCase() || "U"}
										</div>
									)}
									<div className='flex-1 min-w-0'>
										<p className='font-semibold truncate'>{user.username}</p>
										<p className='text-sm text-black/50 dark:text-white/50 truncate'>
											{user.email}
										</p>
									</div>
								</div>
							</div>

							<div className='p-2'>
								<button
									onClick={() => {
										setIsDropdownOpen(false);
										router.push("/profile");
									}}
									className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left'
								>
									<User className='w-5 h-5 text-black/60 dark:text-white/60' />
									<span>Tài khoản của tôi</span>
								</button>
								<button
									onClick={handleLogout}
									className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left'
								>
									<LogOut className='w-5 h-5' />
									<span>Đăng xuất</span>
								</button>
							</div>
						</DropDownContent>
					) : (
						<Button className='px-4 py-2 text-sm' onClick={() => router.push("/sign-in")}>
							<LogIn className='w-4 h-4 mr-2' />
							Đăng nhập
						</Button>
					)}
				</div>
			</header>

			<main className='flex-1 flex items-center justify-center px-6'>
				<div className='w-full max-w-2xl space-y-6'>
					<div className='text-center'>
						<div className='h-12 relative overflow-hidden'>
							<AnimatePresence mode='wait'>
								<motion.div
									key={platform}
									initial={{opacity: 0, y: 20}}
									animate={{opacity: 1, y: 0}}
									exit={{opacity: 0, y: -20}}
									transition={{duration: 0.3, ease: "easeInOut"}}
									className='flex items-center justify-center gap-3'
								>
									{currentPlatform && (
										<>
											<currentPlatform.icon
												className={`w-8 h-8 ${
													platform === "facebook"
														? "text-blue-600"
														: "text-pink-500"
												}`}
											/>
											<span
												className={`text-3xl font-bold ${
													platform === "facebook"
														? "text-blue-600"
														: "text-pink-500"
												}`}
											>
												{currentPlatform.name}
											</span>
										</>
									)}
								</motion.div>
							</AnimatePresence>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<Button
							className='h-[54px] w-[54px] !p-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 !text-black dark:!text-white'
							onClick={() => setIsOverlayOpen(true)}
						>
							<Grid className='w-6 h-6' />
						</Button>
						<TextInput
							placeholder={`Nhập link ${currentPlatform?.name} để tải xuống...`}
							className='text-lg py-4 pr-14'
							containerClassName='flex-1'
							rightElement={
								<Button className='!p-2 !rounded-lg'>
									<Download className='w-5 h-5' />
								</Button>
							}
						/>
					</div>
				</div>
			</main>

			<Overlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)}>
				<div className='bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-sm border border-black/10 dark:border-white/10 shadow-xl'>
					<h3 className='text-xl font-bold mb-6 text-center'>Chọn nền tảng</h3>
					<div className='grid grid-cols-2 gap-4'>
						{platforms.map((p) => (
							<button
								key={p.id}
								onClick={() => {
									setPlatform(p.id);
									setIsOverlayOpen(false);
								}}
								className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
									platform === p.id
										? "bg-black/5 dark:bg-white/10 border-black dark:border-white"
										: "bg-transparent border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
								}`}
							>
								<p.icon
									className={`w-8 h-8 ${
										p.id === "facebook" ? "text-blue-600" : "text-pink-500"
									}`}
								/>
								<span className='font-medium'>{p.name}</span>
							</button>
						))}
					</div>
				</div>
			</Overlay>
		</div>
	);
}
