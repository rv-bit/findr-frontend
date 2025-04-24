export type Comments = {
	id: number;
	postId: string | null;
	text: string | null;
	username: string;
	createdAt: Date;
	updatedAt: Date;

	postTitle?: string | null;
};

export type Post = {
	id: string;
	slug: string;
	title: string;
	content: string;
	username: string;
	createdAt: Date;
	updatedAt: Date;

	likesCount: number;
	commentsCount: number;

	upvoted?: boolean;
	downvoted?: boolean;
};
