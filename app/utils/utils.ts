import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatNumber = (num: number | string): string => {
	const n = typeof num === "string" ? parseInt(num, 10) : num;
	if (isNaN(n)) return "0";
	if (n >= 1000000) {
		return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
	}
	if (n >= 1000) {
		return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
	}
	return n.toString();
};
