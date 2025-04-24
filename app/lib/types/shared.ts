export type User = {
	username: string;
	image: string | null | undefined;
	about_description: string | null | undefined;
};

export type Comments = {
	id: number;
	postId: string | null;
	text: string | null;
	createdAt: Date;
	updatedAt: Date;

	postTitle?: string | null;
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
