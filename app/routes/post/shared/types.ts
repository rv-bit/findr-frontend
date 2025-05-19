import type { User } from "~/lib/types/shared";

export type CommentNode = {
	id: string;
	text: string;
	postId: string;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date;

	likesCount: number;

	upvoted: boolean;
	downvoted: boolean;

	user: User;
	replyCount: number;
};
