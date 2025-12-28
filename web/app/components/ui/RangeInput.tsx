"use client";

import React from "react";
import {cn} from "@/app/utils/utils";

interface RangeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
}

export const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
	({className, ...props}, ref) => {
		return (
			<input
				ref={ref}
				type='range'
				className={cn(
					"w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer",
					"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
					"[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black dark:[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110",
					className
				)}
				{...props}
			/>
		);
	}
);

RangeInput.displayName = "RangeInput";
