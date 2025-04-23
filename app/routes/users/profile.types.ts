export type User = {
	id: string;
	username: string;
	image: string | null | undefined;
	about_description: string | null | undefined;
};

export type CommentResponse = {
	id: number;
	text: string;
	userId: string;
	postId: number;
	createdAt: Date;
	updatedAt: Date;
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
	comments: CommentResponse[];
};
