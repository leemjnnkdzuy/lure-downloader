"use client";

import {useEffect, useRef} from "react";
import {useInView, useMotionValue, useSpring} from "framer-motion";

interface AnimatedCounterProps {
	value: number;
	direction?: "up" | "down";
	className?: string;
}

export const AnimatedCounter = ({
	value,
	direction = "up",
	className = "",
}: AnimatedCounterProps) => {
	const ref = useRef<HTMLSpanElement>(null);
	const motionValue = useMotionValue(direction === "down" ? value : 0);
	const springValue = useSpring(motionValue, {
		damping: 60,
		stiffness: 100,
	});
	const isInView = useInView(ref, {once: true, margin: "-100px"});

	useEffect(() => {
		if (isInView) {
			motionValue.set(value);
		}
	}, [motionValue, isInView, value]);

	useEffect(() => {
		springValue.on("change", (latest) => {
			if (ref.current) {
				ref.current.textContent = Intl.NumberFormat("en-US").format(
					Math.floor(latest)
				);
			}
		});
	}, [springValue]);

	return <span className={className} ref={ref} />;
};
