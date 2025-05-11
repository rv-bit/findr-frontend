import editor_stylesheet from "~/styles/card.post.mdx.css?url";
import type { Route } from "./+types/page.$comment";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation, useNavigate } from "react-router";

import axiosInstance from "~/lib/axios.instance";
import queryClient from "~/lib/query-client";

import { authClient } from "~/lib/auth-client";

import type { Post, User } from "~/lib/types/shared";

import type { CommentNode } from "../post/shared/types";

import Comment from "./components/comments.nodes";
import PostCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ data, params }: Route.MetaArgs) {
	const slug = data ? data.postData.slug : params.commentId;
	return [{ title: `f/${slug}` }, { name: "description", content: "Findr Post as Individual Comment Thread" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { commentId } = params;

	if (!commentId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const cachedData = queryClient.getQueryData(["individual-comment", commentId]) as { postData: Post & { user: User }; commentData: CommentNode };
	if (cachedData) {
		return {
			...cachedData,
		};
	}

	try {
		const commentResponse = await axiosInstance.get(`/api/v0/comments/comment/${commentId}`);
		if (!commentResponse || !commentResponse.data) {
			throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
		}

		const data = commentResponse.data as {
			postData: Post & { user: User };
			commentData: CommentNode;
		};

		queryClient.setQueryData(["individual-comment", commentId], data);

		return {
			...data,
		};
	} catch (error) {
		console.error("Error loading post data:", error);
		throw new Response("", { status: 302, headers: { Location: "/" } });
	}
}

export default function Index({ loaderData, params }: Route.ComponentProps) {
	const { data: session } = authClient.useSession();

	const navigate = useNavigate();
	const location = useLocation();

	// this is just to create a cache for the post inside the indexdb persister
	const { data, isLoading } = useQuery<{
		postData: Post & { user: User };
		commentData: CommentNode;
	}>({
		staleTime: 1000 * 60 * 1, // 1 minutes
		queryKey: ["individual-comment", params.commentId],
		queryFn: () => axiosInstance.get(`/api/v0/comments/comment/${params.commentId}`).then((res) => res.data),
		initialData: loaderData,
	});

	React.useEffect(() => {
		const currentPath = location.pathname;

		return () => {
			if (currentPath.startsWith(`/post/${params.postId}`)) {
				queryClient.removeQueries({ queryKey: ["individual-comment", params.commentId], exact: true });
				queryClient.removeQueries({ queryKey: ["individual-comment-replies"], exact: false });
			}
		};
	}, [location.pathname, params]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-start pb-5 max-md:w-screen">
			<div className="flex w-full max-w-7xl flex-col gap-4 px-20 pt-8 max-2xl:pr-8 max-2xl:pl-5">
				{isLoading ? (
					<div className="flex h-full w-full items-center justify-center">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-400 border-t-transparent" />
					</div>
				) : (
					<>
						<PostCard
							postData={data.postData}
							commentId={params.commentId}
							session={session}
							onBackButtonClick={() => {
								navigate(-1);
							}}
							className="w-full"
						/>

						<section className="flex flex-col gap-5 overflow-hidden py-2">
							<Comment comment={data.commentData} session={session} />
						</section>
					</>
				)}
			</div>
		</div>
	);
}
