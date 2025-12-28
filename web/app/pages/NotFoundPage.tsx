"use client";

import {Home, Moon, Sun, AlertCircle} from "lucide-react";
import {motion} from "framer-motion";
import Link from "next/link";

import {Button} from "@/app/components/ui/Button";
import {useTheme} from "@/app/hooks/useTheme";

export default function NotFoundPage() {
	const {theme, toggleTheme} = useTheme();

	return (
		<div className='min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300'>
			<header className='flex items-center justify-end px-4 sm:px-10 py-4 sm:py-6'>
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

			<main className='flex-1 flex items-center justify-center px-4 sm:px-6'>
				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					transition={{duration: 0.4}}
					className='text-center'
				>
					<motion.h1
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.2}}
						className='text-7xl sm:text-9xl font-bold mb-2 bg-gradient-to-br from-black/80 to-black/40 dark:from-white/80 dark:to-white/40 bg-clip-text text-transparent'
					>
						404
					</motion.h1>

					<motion.h2
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.3}}
						className='text-xl sm:text-2xl font-semibold mb-3'
					>
						Không tìm thấy trang
					</motion.h2>

					<motion.p
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.4}}
						className='text-sm sm:text-base text-black/50 dark:text-white/50 mb-8 sm:mb-10 max-w-md mx-auto'
					>
						Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đến địa chỉ khác.
					</motion.p>

					<motion.div
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.4, delay: 0.5}}
					>
						<Link href='/'>
							<Button className='px-6 py-3 text-base font-medium'>
								<Home className='w-5 h-5 mr-2' />
								Về trang chủ
							</Button>
						</Link>
					</motion.div>
				</motion.div>
			</main>

			<footer className='py-4 sm:py-6 text-center'>
				<p className='text-xs sm:text-sm text-black/30 dark:text-white/30'>
					Lure Downloader
				</p>
			</footer>
		</div>
	);
}
