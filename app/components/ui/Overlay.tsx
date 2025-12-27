"use client";

import React from "react";
import {motion, AnimatePresence} from "framer-motion";
import {cn} from "@/app/utils/utils";

interface OverlayProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
}

export const Overlay = ({
	isOpen,
	onClose,
	children,
	className,
}: OverlayProps) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
					transition={{duration: 0.2}}
					className='fixed inset-0 z-50 flex items-center justify-center p-4'
					onClick={onClose}
				>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
					<motion.div
						initial={{opacity: 0, scale: 0.95, y: 10}}
						animate={{opacity: 1, scale: 1, y: 0}}
						exit={{opacity: 0, scale: 0.95, y: 10}}
						transition={{
							duration: 0.2,
							type: "spring",
							stiffness: 300,
							damping: 30,
						}}
						onClick={(e: React.MouseEvent) => e.stopPropagation()}
						className={cn("relative z-10", className)}
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
