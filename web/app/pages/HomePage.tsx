"use client";

import {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {LogIn, Moon, Sun, Download, LogOut, User, ChevronDown, History, Clipboard, Video, Users} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

import {images, platformLogos} from "@/app/assets";

import {DropDownContent} from "@/app/components/ui/DropDown";
import {Button} from "@/app/components/ui/Button";
import {TextInput} from "@/app/components/ui/TextInput";
import {useTheme} from "@/app/hooks/useTheme";
import {useAuth} from "@/app/hooks/useAuth";

import {TikTokService, TikTokVideoData, UserVideosData} from "@/app/services/TikTokService";
import {useGlobalNotification} from "@/app/context/GlobalNotificationContext";
import {TikTokDownloader} from "@/app/components/common/TikTokDownloader";
import {TikTokBulkDownloader} from "@/app/components/common/TikTokBulkDownloader";
import {AnimatedCounter} from "@/app/components/ui/AnimatedCounter";

export default function HomePage() {
	const {theme, toggleTheme} = useTheme();
	const {user, isAuthenticated, logout, loading: authLoading} = useAuth();
	const {showNotification} = useGlobalNotification();
	const router = useRouter();

	const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
	const [platform, setPlatform] = useState<"tiktok" | "douyin" | "instagram" | "youtube">("tiktok");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [loadingState, setLoadingState] = useState<{message: string; count?: number} | null>(null);
	const [videoData, setVideoData] = useState<TikTokVideoData | null>(null);
	const [userVideosData, setUserVideosData] = useState<UserVideosData | null>(null);

	const [tiktokMode, setTiktokMode] = useState<"single" | "bulk">("single");
	const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

	const tiktokModes = [
		{id: "single", name: "Tải video đơn", icon: Video, description: "Tải một video từ link"},
		{id: "bulk", name: "Tải tất cả video", icon: Users, description: "Tải toàn bộ video của user"},
	] as const;

	const platforms = [
		{id: "tiktok", name: "TikTok", logo: platformLogos.tiktok},
		{id: "douyin", name: "Douyin", logo: platformLogos.douyin},
		{id: "instagram", name: "Instagram", logo: platformLogos.instagram},
		{id: "youtube", name: "YouTube", logo: platformLogos.youtube},
	] as const;

	const currentPlatform = platforms.find((p) => p.id === platform);

	const handleLogout = async () => {
		setIsDropdownOpen(false);
		await logout();
	};

	const handleGetInfo = async () => {
		if (!url) return;
		if (platform !== "tiktok") {
			return;
		}

		let currentMode = tiktokMode;
		// Fix: Exclude /photo/ links from bulk mode detection
		if (url.includes("/@") && !url.includes("/video/") && !url.includes("/photo/")) {
			currentMode = "bulk";
			setTiktokMode("bulk");
		} else {
			currentMode = "single";
			setTiktokMode("single");
		}

		setIsLoading(true);
		setVideoData(null);
		setUserVideosData(null);
		setLoadingState({message: "Đang khởi tạo..."});

		try {
			if (currentMode === "bulk") {
				// Use SSE for bulk download
				const sse = TikTokService.getUserVideosSSE(
					url,
					(data) => {
						setLoadingState((prev) => ({
							message: `Đang tìm thấy ${data.count} video...`,
							count: data.count,
						}));
					},
					(data) => {
						setLoadingState((prev) => ({
							...prev,
							message: data.message,
						}));
					},
					(data) => {
						setUserVideosData(data);
						setIsLoading(false);
						setLoadingState(null);
					},
					(error) => {
						console.error(error);
						showNotification(error || "Có lỗi xảy ra", "error");
						setIsLoading(false);
						setLoadingState(null);
					}
				);
			} else {
				const data = await TikTokService.getVideoInfo(url);
				setVideoData(data);
				setIsLoading(false);
				setLoadingState(null);
			}
		} catch (err: any) {
			console.error(err);
			showNotification(err.message || "Có lỗi xảy ra", "error");
			setIsLoading(false);
			setLoadingState(null);
		}
	};

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setUrl(text);
			
			if (platform === "tiktok") {
                // Fix: Exclude /photo/ links from bulk mode detection
				if (text.includes("/@") && !text.includes("/video/") && !text.includes("/photo/")) {
					setTiktokMode("bulk");
				} else {
					setTiktokMode("single");
				}
			}
		} catch (err) {
			console.error("Failed to read clipboard:", err);
		}
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
				<div className='flex items-center gap-2'>
					{platform === "tiktok" && (
						<DropDownContent
							trigger={
								<button className='flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors'>
									<AnimatePresence mode='wait'>
										{tiktokMode === "single" ? (
											<motion.div
												key='single-icon'
												initial={{opacity: 0, scale: 0.5}}
												animate={{opacity: 1, scale: 1}}
												exit={{opacity: 0, scale: 0.5}}
												transition={{duration: 0.2}}
											>
												<Video className='w-5 h-5' />
											</motion.div>
										) : (
											<motion.div
												key='bulk-icon'
												initial={{opacity: 0, scale: 0.5}}
												animate={{opacity: 1, scale: 1}}
												exit={{opacity: 0, scale: 0.5}}
												transition={{duration: 0.2}}
											>
												<Users className='w-5 h-5' />
											</motion.div>
										)}
									</AnimatePresence>
									<span className='font-medium hidden sm:inline'>
										{tiktokModes.find((m) => m.id === tiktokMode)?.name}
									</span>
									<ChevronDown
										className={`w-4 h-4 transition-transform ${isModeDropdownOpen ? "rotate-180" : ""}`}
									/>
								</button>
							}
							isOpen={isModeDropdownOpen}
							onOpenChange={setIsModeDropdownOpen}
							align='right'
							className='w-56 bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10'
						>
							<div className='p-2'>
								{tiktokModes.map((mode) => (
									<button
										key={mode.id}
										onClick={() => {
											setTiktokMode(mode.id);
											setIsModeDropdownOpen(false);
											setVideoData(null);
											setUrl("");
										}}
										className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
											tiktokMode === mode.id
												? "bg-black/10 dark:bg-white/10"
												: "hover:bg-black/5 dark:hover:bg-white/5"
										}`}
									>
										<mode.icon className='w-5 h-5 mt-0.5 shrink-0' />
										<div>
											<span className='font-medium block'>{mode.name}</span>
											<span className='text-xs text-black/50 dark:text-white/50'>
												{mode.description}
											</span>
										</div>
									</button>
								))}
							</div>
						</DropDownContent>
					)}
					<DropDownContent
						trigger={
							<button className='flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors'>
								{currentPlatform && (
									<Image
										src={currentPlatform.logo}
										alt={currentPlatform.name}
										width={24}
										height={24}
										className='w-6 h-6 object-contain'
									/>
								)}
								<span className='font-medium hidden sm:inline'>{currentPlatform?.name}</span>
								<ChevronDown
									className={`w-4 h-4 transition-transform ${isPlatformDropdownOpen ? "rotate-180" : ""}`}
								/>
							</button>
						}
						isOpen={isPlatformDropdownOpen}
						onOpenChange={setIsPlatformDropdownOpen}
						align='right'
						className='w-48 bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10'
					>
						<div className='p-2'>
							{platforms.map((p) => (
								<button
									key={p.id}
									onClick={() => {
										setPlatform(p.id);
										setIsPlatformDropdownOpen(false);
									}}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
										platform === p.id
											? "bg-black/10 dark:bg-white/10"
											: "hover:bg-black/5 dark:hover:bg-white/5"
									}`}
								>
									<Image
										src={p.logo}
										alt={p.name}
										width={24}
										height={24}
										className='w-6 h-6 object-contain'
									/>
									<span className='font-medium'>{p.name}</span>
								</button>
							))}
						</div>
					</DropDownContent>
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
					{isAuthenticated && (
						<Button
							onClick={() => router.push("/history")}
							className='!p-3 !bg-transparent !border-0 hover:!bg-black/5 dark:hover:!bg-white/10 !shadow-none'
						>
							<History className='w-5 h-5 text-black dark:text-white' />
						</Button>
					)}

					{authLoading ? (
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
											<Image
												src={currentPlatform.logo}
												alt={currentPlatform.name}
												width={32}
												height={32}
												className='w-8 h-8 object-contain'
											/>
											<span className='text-3xl font-bold'>
												{currentPlatform.name}
											</span>
										</>
									)}
								</motion.div>
							</AnimatePresence>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<TextInput
						placeholder={
							platform === "tiktok" && tiktokMode === "bulk"
								? "Nhập link profile TikTok (VD: https://tiktok.com/@username)..."
								: `Nhập link ${currentPlatform?.name} để tải xuống...`
						}
							className='text-lg py-4 pr-14'
							containerClassName='flex-1'
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							disabled={isLoading}
							rightElement={
								<Button
									className='!p-2 !rounded-lg bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
									onClick={handlePaste}
									title='Dán từ clipboard'
								>
									<Clipboard className='w-5 h-5' />
								</Button>
							}
						/>

						<Button
							className='h-[54px] w-[54px] !p-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 !text-black dark:!text-white'
							onClick={handleGetInfo}
							disabled={isLoading || !url}
						>
							{isLoading ? (
								<div className='w-6 h-6 border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin' />
							) : (
								<Download className='w-6 h-6' />
							)}
						</Button>
					</div>

					{isLoading && loadingState && (
						<motion.div
							initial={{opacity: 0, y: -10}}
							animate={{opacity: 1, y: 0}}
							className='flex items-center justify-center gap-2 text-sm font-medium text-black/60 dark:text-white/60'
						>
							{loadingState.count !== undefined ? (
								<>
									<span>Đã tìm thấy:</span>
									<AnimatedCounter 
										value={loadingState.count} 
										className="text-xl font-bold text-blue-600 dark:text-blue-400 min-w-[30px] text-center" 
									/>
									<span>video</span>
								</>
							) : (
								<span className="animate-pulse">{loadingState.message}</span>
							)}
						</motion.div>
					)}

					<AnimatePresence mode='wait'>
						{videoData && tiktokMode === "single" && (
							<motion.div
								key='single-result'
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								exit={{opacity: 0, y: -20}}
								transition={{duration: 0.3}}
							>
								<TikTokDownloader data={videoData} />
							</motion.div>
						)}
						{userVideosData && tiktokMode === "bulk" && (
							<motion.div
								key='bulk-result'
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								exit={{opacity: 0, y: -20}}
								transition={{duration: 0.3}}
							>
								<TikTokBulkDownloader data={userVideosData} />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</main>
		</div>
	);
}
