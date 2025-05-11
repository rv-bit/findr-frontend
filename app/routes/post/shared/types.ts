import type { User } from "~/lib/types/shared";

export type CommentNode = {
	id: string;
	text: string;
	postId: string;
	parentId: string | null;
	upvoted: boolean;
	downvoted: boolean;
	user: User;
	createdAt: Date;
	updatedAt: Date;
	replyCount: number;
};
