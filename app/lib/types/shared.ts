export type User = {
	username: string;
	image: string | null | undefined;
	about_description: string | null | undefined;

	postsCount: number;
	commentsCount: number;

	createdAt: Date;
};

export type Comments = {
	id: string;
	postId: string | null;
	text: string | null;

	upvoted: boolean;
	downvoted: boolean;

	createdAt: Date;
	updatedAt: Date;

	postTitle?: string | null;
	repliedTo?: string | null;
};

export type Post = {
	id: string;
	slug: string;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;

	likesCount: number;
	commentsCount: number;

	upvoted?: boolean;
	downvoted?: boolean;
};
