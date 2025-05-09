import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseUserAgent(userAgent: string): {
	system: string;
	browser: string;
	isMobile: boolean;
} {
	const ua = userAgent.toLowerCase();

	let system = "Unknown";
	let isMobile = false;

	if (ua.includes("android")) {
		system = "Android";
		isMobile = true;
	} else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
		system = "iOS";
		isMobile = true;
	} else if (ua.includes("windows")) {
		system = "Windows";
	} else if (ua.includes("mac os") || ua.includes("macos")) {
		system = "Macintosh";
	} else if (ua.includes("linux")) {
		system = "Linux";
	}

	const browserMatchers: {
		regex: RegExp;
		name: (match: RegExpMatchArray) => string;
	}[] = [
		{ regex: /firefox\/(\d+(\.\d+)?)/, name: (match) => `Firefox ${match[1]}` },
		{ regex: /edg\/(\d+(\.\d+)?)/, name: (match) => `Edge ${match[1]}` },
		{ regex: /chrome\/(\d+(\.\d+)?)/, name: (match) => `Chrome ${match[1]}` },
		{ regex: /safari\/(\d+(\.\d+)?)/, name: (match) => `Safari ${match[1]}` },
		{
			regex: /(opera|opr)\/(\d+(\.\d+)?)/,
			name: (match) => `Opera ${match[2]}`,
		},
	];

	let browser = "Unknown";

	for (const matcher of browserMatchers) {
		const match = ua.match(matcher.regex);
		if (match && !(matcher.regex.source.includes("safari") && ua.includes("chrome"))) {
			browser = matcher.name(match);
			break;
		}
	}

	return { system, browser, isMobile };
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
