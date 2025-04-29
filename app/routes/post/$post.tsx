import editor_stylesheet from "~/styles/card.post.mdx.css?url";
import type { Route } from "./+types/$post";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLoaderData, useNavigate } from "react-router";

import axiosInstance from "~/lib/axios-instance";
import queryClient from "~/lib/query/query-client";

import type { Post, User } from "~/lib/types/shared";

import CommentSection from "./components/comments.section";
import PostCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ data }: Route.MetaArgs) {
	const { slug } = data.data;
	return [{ title: `f/${slug}` }, { name: "description", content: "Findr Post" }];
}

export async function loader({ params }: Route.LoaderArgs) {
	const { postId } = params;

	if (!postId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const cachedData = queryClient.getQueryData(["post", postId]) as Post & { user: User };
	if (cachedData) {
		return {
			data: cachedData,
		};
	}

	const response = await axiosInstance.get(`/api/v0/post/${postId}`);
	if (response.status !== 200) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const data = response.data.data as Post & { user: User };
	if (!data) {
		// Check if the post exists
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	if (!cachedData) {
		queryClient.setQueryData(["post", postId], data);
	}
	return { data };
}

export default function Index({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const loaderData = useLoaderData<typeof loader>();

	const { data, isPending } = useQuery({
		staleTime: 1000 * 30, // 30 seconds
		queryKey: ["post", params.postId],
		queryFn: () => axiosInstance.get(`/api/v0/post/${params.postId}`).then((res) => res.data.data),
		initialData: loaderData.data,
	});

	const commentTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
	const handleOnCommentIconClick = () => {
		if (!commentTextAreaRef.current) return;

		commentTextAreaRef.current.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		commentTextAreaRef.current.focus();
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-start pb-5 max-md:w-screen">
			<div className="flex w-full max-w-7xl flex-col gap-4 px-20 pt-8 max-2xl:px-5">
				{isPending ? (
					<div className="flex h-full w-full items-center justify-center">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-400 border-t-transparent" />
					</div>
				) : (
					data && (
						<>
							<PostCard
								data={data}
								onCommentIconClick={handleOnCommentIconClick}
								onBackButtonClick={() => {
									navigate(-1);

									queryClient.removeQueries({
										queryKey: ["post", data.id],
										exact: true,
									});
									queryClient.removeQueries({
										queryKey: ["comments", data.id],
										exact: true,
									});
									queryClient.removeQueries({
										queryKey: ["replies"],
										exact: false,
									});
								}}
								className="w-full"
							/>

							<CommentSection ref={commentTextAreaRef} data={data} className="w-full py-2" />
						</>
					)
				)}
			</div>
		</div>
	);
}
