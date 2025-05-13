import type { CommentNode } from "./types";

export const sortOptions: {
	title: string;
	value: string;
	sortingFn?: (a: CommentNode, b: CommentNode) => number;
}[] = [
	{
		title: "Newest",
		value: "newest",
		sortingFn: (a: CommentNode, b: CommentNode) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		},
	},
	{
		title: "Oldest",
		value: "oldest",
		sortingFn: (a: CommentNode, b: CommentNode) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		},
	},
	{
		title: "Top",
		value: "most-upvoted",
		sortingFn: (a: CommentNode, b: CommentNode) => {
			return b.likesCount - a.likesCount;
		},
	},
];
