import editor_stylesheet from "~/styles/card.post.mdx.css?url";
import type { Route } from "./+types/$post";

import React from "react";
import { Await, useLocation, useNavigate } from "react-router";

import axiosInstance from "~/lib/axios-instance";
import queryClient from "~/lib/query/query-client";

import type { Post, User } from "~/lib/types/shared";

import CommentSection from "./components/comments.section";
import PostCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ data }: Route.MetaArgs) {
	// Use the pre-fetched slug from the loader
	const slug = data.slug || "post";
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
			data: Promise.resolve(cachedData),
			slug: cachedData.slug, // Use the slug from cached data
		};
	}

	try {
		const metaResponse = await axiosInstance.get(`/api/v0/post/${postId}`);

		if (metaResponse.status !== 200 || !metaResponse.data.data) {
			throw new Response("Post not found", { status: 404 });
		}

		const metaData = metaResponse.data.data;

		queryClient.setQueryData(["post", postId], metaData);

		return {
			data: metaData,
			slug: metaData.slug,
		};
	} catch (error) {
		console.error("Error loading post data:", error);
		throw new Response("", { status: 302, headers: { Location: "/" } });
	}
}

export default function Index({ loaderData, params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const location = useLocation();

	const commentTextAreaRef = React.useRef<HTMLTextAreaElement>(null);

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
				queryClient.removeQueries({ queryKey: ["replies"], exact: false });
			}
		};
	}, [location.pathname, params.postId]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-start pb-5 max-md:w-screen">
			<div className="flex w-full max-w-7xl flex-col gap-4 px-20 pt-8 max-2xl:pr-8 max-2xl:pl-5">
				<React.Suspense
					fallback={
						<div className="flex h-full w-full items-center justify-center">
							<div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-400 border-t-transparent" />
						</div>
					}
				>
					<Await resolve={loaderData.data}>
						{(value) => (
							<>
								<PostCard
									data={value}
									onCommentIconClick={handleOnCommentIconClick}
									onBackButtonClick={() => {
										navigate(-1);
									}}
									className="w-full"
								/>

								<CommentSection ref={commentTextAreaRef} data={value} className="w-full py-2" />
							</>
						)}
					</Await>
				</React.Suspense>
			</div>
		</div>
	);
}
