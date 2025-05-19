export type User = {
	username: string;
	image: string | null | undefined;
	about_description: string | null | undefined;

	postsCount?: number;
	commentsCount?: number;

	createdAt: Date;
};

export type Comment = {
	id: string;
	postId: string | null;
	text: string | null;
	createdAt: Date;
	updatedAt: Date;

	likesCount: number;

	upvoted: boolean;
	downvoted: boolean;

	post: {
		slug: string;
		title: string;
	};
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
