import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(date: number | Date): string {
	const dateInDaysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
	const dateInHoursAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
	const dateInMinutesAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60));
	const dateInSecondsAgo = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

	let timeAgo = "";
	if (dateInDaysAgo > 0) {
		timeAgo = `${dateInDaysAgo} days ago`;
	} else if (dateInHoursAgo > 0) {
		timeAgo = `${dateInHoursAgo} hours ago`;
	} else if (dateInMinutesAgo > 0) {
		timeAgo = `${dateInMinutesAgo} minutes ago`;
	} else {
		timeAgo = `${dateInSecondsAgo} seconds ago`;
	}

	return timeAgo;
}
