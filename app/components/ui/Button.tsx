import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

export const Button = ({children, style, className, ...props}: ButtonProps) => {
	return (
		<button
			style={{
				transition:
					"opacity 0.1s ease-out, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
				...style,
			}}
			className={`cursor-pointer inline-flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/20 px-8 py-4 text-lg font-medium text-black dark:text-white shadow-lg transition-all hover:bg-black/10 dark:hover:bg-white/20 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 dark:focus-visible:ring-white/50 ${
				className || ""
			}`}
			{...props}
		>
			{children}
		</button>
	);
};
