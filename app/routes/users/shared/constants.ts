import type { LucideIcon } from "lucide-react";
import type { Comments, Post } from "~/lib/types/shared";

export const types: {
	title: string;
	url: string;
	queryKey: string;
	query: string;
	icon?: LucideIcon;
	disabled?: boolean;
}[] = [
	{
		title: "Overview",
		url: "/users",
		queryKey: "type",
		query: "overview",
	},
	{
		title: "Posts",
		url: "/users",
		queryKey: "type",
		query: "posts",
	},
	{
		title: "Comments",
		url: "/users",
		queryKey: "type",
		query: "comments",
	},
];

export const sortOptions: {
	title: string;
	value: string;
	sortingFn: (a: Post | Comments, b: Post | Comments) => number;
}[] = [
	{
		title: "Newest",
		value: "newest",
		sortingFn: (a: Post | Comments, b: Post | Comments) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		},
	},
	{
		title: "Oldest",
		value: "oldest",
		sortingFn: (a: Post | Comments, b: Post | Comments) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		},
	},
	{
		title: "Top",
		value: "top",
		sortingFn: (a: Post | Comments, b: Post | Comments) => {
			if ("likesCount" in a && "likesCount" in b) {
				return b.likesCount - a.likesCount;
			}
			return 0;
		},
	},
];
