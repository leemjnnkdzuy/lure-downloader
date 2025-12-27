"use client";

import {useState, useRef, useCallback} from "react";
import {ArrowLeft, Moon, Sun, User, Mail, Lock, Camera, Loader2, CheckCircle, Upload, X, Crop, ZoomIn, ZoomOut, RotateCw, FlipHorizontal} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Cropper from "react-easy-crop";
import type {Point, Area} from "react-easy-crop";

import {Button} from "@/app/components/ui/Button";
import {TextInput} from "@/app/components/ui/TextInput";
import {Overlay} from "@/app/components/ui/Overlay";
import {RangeInput} from "@/app/components/ui/RangeInput";
import {useGlobalNotificationPopup} from "@/app/hooks/useGlobalNotificationPopup";
import {useTheme} from "@/app/hooks/useTheme";
import {useAuth} from "@/app/hooks/useAuth";
import getCroppedImg, {flipImage} from "@/app/utils/canvasUtils";
import { userService } from "@/app/services/UserService";

type Tab = "info" | "password";
type AvatarPhase = "upload" | "crop";

export default function ProfilePage() {
	const {theme, toggleTheme} = useTheme();
	const {user, loading: authLoading, refreshUser} = useAuth();
	const notify = useGlobalNotificationPopup();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<Tab>("info");
	const [isLoading, setIsLoading] = useState(false);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [isAvatarOverlayOpen, setIsAvatarOverlayOpen] = useState(false);
	const [avatarPhase, setAvatarPhase] = useState<AvatarPhase>("upload");
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	
	const [crop, setCrop] = useState<Point>({x: 0, y: 0});
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			notify.error("Mật khẩu xác nhận không khớp", "Lỗi");
			return;
		}

		if (newPassword.length < 6) {
			notify.error("Mật khẩu phải có ít nhất 6 ký tự", "Lỗi");
			return;
		}

		setIsLoading(true);

		try {
			const {data, ok} = await userService.changePassword({
				currentPassword,
				newPassword,
			});

			if (!ok) throw new Error(data.message);

			notify.success("Đổi mật khẩu thành công!", "Thành công");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (e: any) {
			notify.error(e.message || "Có lỗi xảy ra. Vui lòng thử lại.", "Lỗi");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = useCallback((file: File) => {
		if (!file.type.startsWith("image/")) {
			notify.error("Vui lòng chọn file hình ảnh", "Lỗi định dạng");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			setSelectedImage(e.target?.result as string);
			setAvatarPhase("crop");
			setCrop({x: 0, y: 0});
			setZoom(1);
			setRotation(0);
		};
		reader.readAsDataURL(file);
	}, [notify]);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	}, [handleFileSelect]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleCloseAvatarOverlay = () => {
		setIsAvatarOverlayOpen(false);
		setAvatarPhase("upload");
		setSelectedImage(null);
		setCrop({x: 0, y: 0});
		setZoom(1);
		setRotation(0);
	};

	const handleFlipImage = async () => {
		if (selectedImage) {
			const flipped = await flipImage(selectedImage);
			setSelectedImage(flipped);
		}
	};

	const handleSaveAvatar = async () => {
		if (!selectedImage || !croppedAreaPixels) return;

		setIsLoading(true);
		try {
			const croppedImage = await getCroppedImg(
				selectedImage, 
				croppedAreaPixels,
				rotation
			);
			if (!croppedImage) throw new Error("Could not crop image");

			const {data, ok} = await userService.updateAvatar(croppedImage);

			if (!ok) {
				throw new Error(data.message || "Không thể cập nhật avatar");
			}
			
			await refreshUser();
			notify.success("Đổi avatar thành công!", "Thành công");
			handleCloseAvatarOverlay();
		} catch (e: any) {
			console.error(e);
			notify.error(e.message || "Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.", "Lỗi");
		} finally {
			setIsLoading(false);
		}
	};

	const tabs = [
		{id: "info" as Tab, label: "Thông tin", icon: User},
		{id: "password" as Tab, label: "Mật khẩu", icon: Lock},
	];

	if (authLoading) {
		return (
			<div className='min-h-screen bg-white dark:bg-black flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin text-black/50 dark:text-white/50' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300'>
			<header className='flex items-center justify-between px-4 sm:px-10 py-4 sm:py-6'>
				<Link href='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
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

			<main className='flex-1 px-4 sm:px-6 py-6 sm:py-8'>
				<div className='max-w-2xl mx-auto'>
					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4}}
						className='text-center mb-8'
					>
						<div className='relative inline-block mb-4'>
							{user?.avatar ? (
								<img
									src={user.avatar}
									alt={user.username}
									className='w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-black/10 dark:border-white/10'
								/>
							) : (
								<div className='w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl'>
									{user?.username?.charAt(0).toUpperCase() || "U"}
								</div>
							)}
							<button
								onClick={() => setIsAvatarOverlayOpen(true)}
								className='absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:opacity-80 transition-opacity'
							>
								<Camera className='w-4 h-4 sm:w-5 sm:h-5' />
							</button>
						</div>
						<h1 className='text-2xl sm:text-3xl font-bold mb-1'>{user?.username}</h1>
						<p className='text-sm sm:text-base text-black/50 dark:text-white/50'>{user?.email}</p>
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.1}}
						className='flex gap-2 mb-6 p-1 bg-black/5 dark:bg-white/5 rounded-xl'
					>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => {
									setActiveTab(tab.id);
								}}
								className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
									activeTab === tab.id
										? "bg-white dark:bg-black shadow-sm text-black dark:text-white"
										: "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
								}`}
							>
								<tab.icon className='w-4 h-4 sm:w-5 sm:h-5' />
								<span className='hidden sm:inline'>{tab.label}</span>
							</button>
						))}
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.2}}
						className='bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6'
					>
						<AnimatePresence mode='wait'>
							{activeTab === "info" && (
								<motion.div
									key='info'
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									exit={{opacity: 0, x: 20}}
									transition={{duration: 0.2}}
									className='space-y-1'
								>
									<div className='flex items-center justify-between py-4 border-b border-black/10 dark:border-white/10'>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
												<User className='w-5 h-5 text-black/60 dark:text-white/60' />
											</div>
											<div>
												<p className='text-xs sm:text-sm text-black/50 dark:text-white/50'>Username</p>
												<p className='font-medium text-sm sm:text-base'>{user?.username}</p>
											</div>
										</div>
										<Button
											onClick={() => router.push("/change-username")}
											className='!py-2 !px-4 text-sm !bg-transparent !border border-black/20 dark:!border-white/20 !text-black dark:!text-white hover:!bg-black/5 dark:hover:!bg-white/5 !shadow-none'
										>
											Đổi
										</Button>
									</div>

									<div className='flex items-center justify-between py-4'>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
												<Mail className='w-5 h-5 text-black/60 dark:text-white/60' />
											</div>
											<div>
												<p className='text-xs sm:text-sm text-black/50 dark:text-white/50'>Email</p>
												<p className='font-medium text-sm sm:text-base'>{user?.email}</p>
											</div>
										</div>
										<Button
											onClick={() => router.push("/change-email")}
											className='!py-2 !px-4 text-sm !bg-transparent !border border-black/20 dark:!border-white/20 !text-black dark:!text-white hover:!bg-black/5 dark:hover:!bg-white/5 !shadow-none'
										>
											Đổi
										</Button>
									</div>
								</motion.div>
							)}

							{activeTab === "password" && (
								<motion.form
									key='password'
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									exit={{opacity: 0, x: 20}}
									transition={{duration: 0.2}}
									onSubmit={handleChangePassword}
									className='space-y-4'
								>
									<TextInput
										label='Mật khẩu hiện tại'
										icon={Lock}
										type='password'
										placeholder='Nhập mật khẩu hiện tại...'
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										required
										disabled={isLoading}
									/>

									<TextInput
										label='Mật khẩu mới'
										icon={Lock}
										type='password'
										placeholder='Nhập mật khẩu mới...'
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										disabled={isLoading}
									/>

									<TextInput
										label='Xác nhận mật khẩu mới'
										icon={Lock}
										type='password'
										placeholder='Nhập lại mật khẩu mới...'
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										disabled={isLoading}
									/>

									<Button
										type='submit'
										className='w-full py-3 text-base font-medium mt-6'
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Loader2 className='w-5 h-5 mr-2 animate-spin' />
												Đang xử lý...
											</>
										) : (
											"Đổi mật khẩu"
										)}
									</Button>
								</motion.form>
							)}
						</AnimatePresence>
					</motion.div>
				</div>
			</main>

			{/* Avatar Change Overlay */}
			<Overlay isOpen={isAvatarOverlayOpen} onClose={handleCloseAvatarOverlay}>
				<div className='bg-white dark:bg-[#1a1a1a] rounded-2xl w-[500px] max-w-[95vw] h-[600px] flex flex-col border border-black/10 dark:border-white/10 shadow-xl overflow-hidden'>
					<div className='flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 flex-shrink-0'>
						<h3 className='text-lg font-semibold'>
							{avatarPhase === "upload" ? "Đổi avatar" : "Cắt ảnh"}
						</h3>
						<button
							onClick={handleCloseAvatarOverlay}
							className='p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
						>
							<X className='w-5 h-5' />
						</button>
					</div>

					<div className='flex-1 relative overflow-hidden'>
						<AnimatePresence mode='wait'>
							{avatarPhase === "upload" && (
								<motion.div
									key='upload'
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									exit={{opacity: 0, x: 20}}
									transition={{duration: 0.2}}
									className='absolute inset-0 p-6 flex flex-col'
								>
									<div
										onDrop={handleDrop}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onClick={() => fileInputRef.current?.click()}
										className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
											isDragging
												? "border-blue-500 bg-blue-500/10"
												: "border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5"
										}`}
									>
										<input
											ref={fileInputRef}
											type='file'
											accept='image/*'
											onChange={handleInputChange}
											className='hidden'
										/>
										<div className='w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
											<Upload className='w-10 h-10 text-black/40 dark:text-white/40' />
										</div>
										<p className='font-medium mb-2 text-lg'>
											{isDragging ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây"}
										</p>
										<p className='text-black/50 dark:text-white/50'>
											hoặc nhấn để chọn file
										</p>
									</div>
								</motion.div>
							)}

							{avatarPhase === "crop" && selectedImage && (
								<motion.div
									key='crop'
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									exit={{opacity: 0, x: 20}}
									transition={{duration: 0.2}}
									className='absolute inset-0 p-6 flex flex-col'
								>
									<div className='relative w-full flex-1 rounded-xl overflow-hidden bg-black/90 mb-4'>
										<Cropper
											image={selectedImage}
											crop={crop}
											zoom={zoom}
											aspect={1}
											rotation={rotation}
											onCropChange={setCrop}
											onCropComplete={onCropComplete}
											onZoomChange={setZoom}
											cropShape="round"
											showGrid={false}
											style={{
												containerStyle: {
													width: "100%",
													height: "100%",
												},
											}}
										/>
									</div>

									<div className='flex-shrink-0'>
										{/* Zoom and Rotate controls */}
										<div className='flex items-center justify-between gap-4 mb-6'>
											<div className="flex items-center gap-2 flex-1">
												<button
													onClick={() => setZoom(Math.max(1, zoom - 0.1))}
													className='p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
												>
													<ZoomOut className='w-4 h-4' />
												</button>
												<div className='flex-1'>
													<RangeInput
														min={1}
														max={3}
														step={0.1}
														value={zoom}
														onChange={(e) => setZoom(Number(e.target.value))}
													/>
												</div>
												<button
													onClick={() => setZoom(Math.min(3, zoom + 0.1))}
													className='p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
												>
													<ZoomIn className='w-4 h-4' />
												</button>
											</div>

											<div className="flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-4">
												<button
													onClick={() => setRotation((prev) => (prev + 90) % 360)}
													className='p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
													title="Xoay 90 độ"
												>
													<RotateCw className='w-4 h-4' />
												</button>
												<button
													onClick={handleFlipImage}
													className='p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
													title="Lật ảnh"
												>
													<FlipHorizontal className='w-4 h-4' />
												</button>
											</div>
										</div>

										<div className='flex gap-3'>
											<Button
												onClick={() => {
													setAvatarPhase("upload");
													setSelectedImage(null);
												}}
												className='flex-1 !bg-transparent !border border-black/20 dark:!border-white/20 !text-black dark:!text-white hover:!bg-black/5 dark:hover:!bg-white/5 !shadow-none'
											>
												Chọn lại
											</Button>
											<Button
												onClick={handleSaveAvatar}
												className='flex-1'
												disabled={isLoading}
											>
												{isLoading ? (
													<>
														<Loader2 className='w-5 h-5 mr-2 animate-spin' />
														Đang lưu...
													</>
												) : (
													<>
														<Crop className='w-5 h-5 mr-2' />
														Lưu avatar
													</>
												)}
											</Button>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</Overlay>
		</div>
	);
}
