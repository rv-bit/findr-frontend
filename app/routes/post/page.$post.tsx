import core_editor_stylesheet from "@blocknote/shadcn/style.css?url";
import modified_editor_stylesheet from "~/styles/card.post.mdx.css?url";

import type { Route } from "./+types/page.$post";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";

import axiosInstance from "~/lib/axios.instance";
import queryClient from "~/lib/query-client";

import { authClient } from "~/lib/auth-client";

import type { Post, User } from "~/lib/types/shared";

import CommentSection from "./components/comments.section";
import PostCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: core_editor_stylesheet },
	{ rel: "stylesheet", href: modified_editor_stylesheet }, // override styles
];

export function meta({ data, params }: Route.MetaArgs) {
	const slug = data ? data.slug : params.postId;
	return [{ title: `f/${slug}` }, { name: "description", content: "Findr Post" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { postId } = params;

	if (!postId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const cachedData = queryClient.getQueryData(["post", postId]) as Post & { user: User };
	if (cachedData) {
		return {
			data: cachedData,
			slug: cachedData.slug, // Use the slug from cached data
		};
	}

	try {
		const metaResponse = await axiosInstance.get(`/api/v0/post/${postId}`);
		if (!metaResponse || !metaResponse.data) {
			throw new Response("Post not found", { status: 404 });
		}

		const data = metaResponse.data.data;
		queryClient.setQueryData(["post", postId], data);

		return {
			data: data as Post & { user: User },
			slug: data.slug as string,
		};
	} catch (error) {
		console.error("Error loading post data:", error);
		throw new Response("", { status: 302, headers: { Location: "/" } });
	}
}

export default function Index({ loaderData, params }: Route.ComponentProps) {
	const { data: session } = authClient.useSession();

	const navigateType = useNavigationType();
	const navigate = useNavigate();
	const location = useLocation();

	const commentTextAreaRef = React.useRef<HTMLTextAreaElement>(null);

	const { data, isLoading } = useQuery<Post & { user: User }>({
		// this is just to create a cache for the post inside the indexdb perister
		staleTime: 1000 * 60 * 1, // 1 minutes
		queryKey: ["post", params.postId],
		queryFn: () => axiosInstance.get(`/api/v0/post/${params.postId}`).then((res) => res.data.data),
		initialData: loaderData.data,
	});

	const handleOnCommentIconClick = () => {
		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.scrollIntoView({
				block: "center",
				behavior: "smooth",
			});

			commentTextAreaRef.current.focus();
		}
	};

	React.useEffect(() => {
		const currentPath = location.pathname;

		return () => {
			if (currentPath.startsWith(`/post/${params.postId}`)) {
				queryClient.removeQueries({ queryKey: ["post", params.postId], exact: true });
				queryClient.removeQueries({ queryKey: ["comments", params.postId], exact: true });
				queryClient.removeQueries({ queryKey: ["comment-replies"], exact: false });
			}
		};
	}, [location.pathname, params.postId]);

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
							data={data}
							session={session}
							onCommentIconClick={handleOnCommentIconClick}
							onBackButtonClick={() => {
								if (navigateType === "POP") {
									// this means its maybe from a blank new tab, PUSH would be if a user has come from a link
									navigate("/");
									return;
								}

								navigate(-1);
							}}
							className="w-full"
						/>
						<CommentSection ref={commentTextAreaRef} data={data} session={session} className="w-full py-2" />
					</>
				)}
			</div>
		</div>
	);
}
