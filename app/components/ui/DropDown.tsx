"use client";

import React, {useState, useRef, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {cn} from "@/app/utils/utils";

interface DropDownItem {
	label: string;
	icon?: React.ElementType;
	onClick?: () => void;
	className?: string;
	danger?: boolean;
}

interface DropDownProps {
	trigger: React.ReactNode;
	items: DropDownItem[];
	align?: "left" | "right";
	className?: string;
}

interface DropDownContentProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	align?: "left" | "right";
	className?: string;
}

export const DropDownContent = ({
	trigger,
	children,
	isOpen,
	onOpenChange,
	align = "left",
	className,
}: DropDownContentProps) => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				onOpenChange(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onOpenChange]);

	return (
		<div className='relative' ref={dropdownRef}>
			<div onClick={() => onOpenChange(!isOpen)}>{trigger}</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{opacity: 0, y: 10, scale: 0.95}}
						animate={{opacity: 1, y: 0, scale: 1}}
						exit={{opacity: 0, y: 10, scale: 0.95}}
						transition={{duration: 0.1}}
						className={cn(
							"absolute top-full mt-2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden",
							align === "right" ? "right-0" : "left-0",
							className
						)}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export const DropDown = ({
	trigger,
	items,
	align = "right",
	className,
}: DropDownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className='relative' ref={dropdownRef}>
			<div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{opacity: 0, y: 10, scale: 0.95}}
						animate={{opacity: 1, y: 0, scale: 1}}
						exit={{opacity: 0, y: 10, scale: 0.95}}
						transition={{duration: 0.1}}
						className={cn(
							"absolute top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden",
							align === "right" ? "right-0" : "left-0",
							className
						)}
					>
						<div className='p-1.5'>
							{items.map((item, index) => (
								<button
									key={index}
									onClick={() => {
										item.onClick?.();
										setIsOpen(false);
									}}
									className={cn(
										"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
										item.danger
											? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
											: "text-white/70 hover:bg-white/10 hover:text-white",
										item.className
									)}
								>
									{item.icon && (
										<item.icon className='w-4 h-4' />
									)}
									<span className='font-medium'>
										{item.label}
									</span>
								</button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
