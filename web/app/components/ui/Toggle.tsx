"use client";

import React from "react";
import {motion} from "framer-motion";
import {cn} from "@/app/utils/utils";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: string;
	className?: string;
}

export const Toggle = ({checked, onChange, label, className}: ToggleProps) => {
	return (
		<div
			className={cn(
				"flex items-center gap-3 cursor-pointer group",
				className
			)}
			onClick={() => onChange(!checked)}
		>
			<div
				className={cn(
					"w-12 h-7 rounded-full p-1 transition-colors duration-300 relative",
					checked
						? "bg-[#ff79c6]"
						: "bg-white/10 group-hover:bg-white/20"
				)}
			>
				<motion.div
					layout
					transition={{
						type: "spring",
						stiffness: 700,
						damping: 30,
					}}
					className={cn(
						"w-5 h-5 rounded-full shadow-md",
						checked ? "bg-white" : "bg-white/50"
					)}
					animate={{
						x: checked ? 20 : 0,
					}}
				/>
			</div>
			{label && (
				<span
					className={cn(
						"text-sm font-medium transition-colors select-none",
						checked ? "text-white" : "text-white/50"
					)}
				>
					{label}
				</span>
			)}
		</div>
	);
};
