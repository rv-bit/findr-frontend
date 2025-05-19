import type { LucideIcon } from "lucide-react";
import type { Comment, Post } from "~/lib/types/shared";

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
	sortingFn: (a: Post | Comment, b: Post | Comment) => number;
}[] = [
	{
		title: "Newest",
		value: "newest",
		sortingFn: (a: Post | Comment, b: Post | Comment) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		},
	},
	{
		title: "Oldest",
		value: "oldest",
		sortingFn: (a: Post | Comment, b: Post | Comment) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		},
	},
	{
		title: "Top",
		value: "top",
		sortingFn: (a: Post | Comment, b: Post | Comment) => {
			if ("likesCount" in a && "likesCount" in b) {
				return b.likesCount - a.likesCount;
			}
			return 0;
		},
	},
];
