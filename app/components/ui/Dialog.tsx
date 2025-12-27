"use client";

import React from "react";
import {X} from "lucide-react";
import {Overlay} from "./Overlay";
import {cn} from "@/app/utils/utils";

interface DialogProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	className?: string;
	showCloseButton?: boolean;
}

export const Dialog = ({
	isOpen,
	onClose,
	title,
	children,
	className,
	showCloseButton = true,
}: DialogProps) => {
	return (
		<Overlay isOpen={isOpen} onClose={onClose}>
			<div
				className={cn(
					"relative bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl",
					"min-w-[400px] max-w-[90vw] max-h-[85vh] overflow-hidden",
					className
				)}
			>
				{(title || showCloseButton) && (
					<div className='flex items-center justify-between px-6 py-4 border-b border-white/5'>
						{title && (
							<h2 className='text-lg font-semibold text-white'>
								{title}
							</h2>
						)}
						{showCloseButton && (
							<button
								onClick={onClose}
								className='cursor-pointer p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors ml-auto'
							>
								<X className='w-5 h-5' />
							</button>
						)}
					</div>
				)}
				<div className='p-6 overflow-y-auto max-h-[calc(85vh-80px)]'>
					{children}
				</div>
			</div>
		</Overlay>
	);
};
