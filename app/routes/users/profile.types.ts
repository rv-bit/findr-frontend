export type User = {
	id: string;
	username: string;
	image: string | null | undefined;
	about_description: string | null | undefined;
};

export type Comments = {
	id: number;
	postId: number | null;
	text: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	postTitle?: string | null;
};

export type Post = {
	id: number;
	slug: string;
	title: string;
	content: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	likesCount: number;
	commentsCount: number;
	liked?: boolean;
};
