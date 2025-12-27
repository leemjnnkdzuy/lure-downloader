import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	hoverEffect?: boolean;
}

export const Card = ({
	children,
	className,
	style,
	hoverEffect = false,
	...props
}: CardProps) => {
	const baseStyles =
		"bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)";
	const hoverStyles = hoverEffect
		? "hover:bg-white/10 hover:scale-[1.02] hover:border-white/20 hover:shadow-xl hover:shadow-white/5"
		: "";

	return (
		<div
			className={`${baseStyles} ${hoverStyles} ${className || ""}`}
			style={style}
			{...props}
		>
			{children}
		</div>
	);
};
