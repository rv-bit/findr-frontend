import editor_stylesheet from "~/styles/card.post.mdx.css?url";
import type { Route } from "./+types/$post";

import { useLoaderData } from "react-router";

import axiosInstance from "~/lib/axios-instance";
import queryClient from "~/lib/query/query-client";

import type { Post, User } from "~/lib/types/shared";

import React from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import PostCard from "./components/posts.card";

export async function loader({ params }: Route.LoaderArgs) {
	const { postId } = params;

	if (!postId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const cachedData = queryClient.getQueryData(["post", params.postId]) as Post & { user: User };
	if (cachedData) {
		return {
			post: cachedData,
		};
	}

	const response = await axiosInstance.get(`/api/v0/post/${postId}`);
	if (response.status !== 200) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	if (response.data.data.length === 0) {
		// Check if the post exists
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const post = response.data.data as Post & { user: User };
	if (!cachedData) {
		queryClient.setQueryData(["post", params.postSlug], post);
	}
	return { post };
}

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ data }: Route.MetaArgs) {
	const { slug } = data.post;
	return [{ title: `f/${slug}` }, { name: "description", content: "Findr Post" }];
}

export default function Index() {
	const { post } = useLoaderData<typeof loader>();

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
			<div className="flex w-full max-w-7xl flex-col gap-4 px-10 pt-8 max-xl:px-4">
				<PostCard data={post} onCommentIconClick={handleOnCommentIconClick} className="w-full px-4 py-2" />
				<CommentSection ref={commentTextAreaRef} className="w-full py-2 pr-4" />
			</div>
		</div>
	);
}

const CommentSection = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"section">>(({ className, ...props }, commentTextAreaRef) => {
	const [commentButtonClicked, setCommentButtonClicked] = React.useState(false);

	const handleCloseCommentButton = () => {
		setCommentButtonClicked(false);

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.value = "";
			commentTextAreaRef.current.blur();
		}
	};

	return (
		<section className={cn("flex flex-col gap-5", className)}>
			<div
				onClick={() => {
					setCommentButtonClicked(true);
					if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
						commentTextAreaRef.current.focus();
					}
				}}
				className={cn(
					"group relative flex cursor-default flex-col items-center justify-between overflow-hidden rounded-full border bg-transparent px-0 pb-0 font-bricolage text-black dark:bg-transparent dark:text-white",
					{
						"h-auto min-h-35 items-start rounded-xl border-neutral-500/50 focus-within:border-neutral-500 hover:bg-transparent dark:border-white/50 focus-within:dark:border-white dark:hover:bg-transparent":
							commentButtonClicked,
						"h-10 hover:bg-sidebar-foreground/20 dark:hover:bg-sidebar-accent-foreground/10": !commentButtonClicked,
					},
				)}
			>
				<Textarea
					ref={commentTextAreaRef}
					placeholder="Join in the conversation"
					className={cn("rounded-xl border-none px-5 font-bricolage text-black shadow-none focus-within:border-none focus-visible:ring-0 dark:text-white", {
						"min-h-20 resize-y py-3": commentButtonClicked,
						"min-h-0 resize-none": !commentButtonClicked,
					})}
				/>

				{commentButtonClicked && (
					<div className="relative bottom-0 flex h-15 w-full items-end justify-end gap-1 pr-2 pb-2 dark:bg-sidebar">
						<Button
							onClick={(e) => {
								e.stopPropagation();
								handleCloseCommentButton();
							}}
							className="rounded-full bg-sidebar-accent-foreground/30 px-5 py-2 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-sidebar-accent/50 dark:text-white dark:hover:bg-sidebar-foreground/20"
						>
							Cancel
						</Button>
						<Button className="rounded-full bg-primary-500/70 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-primary-500 dark:bg-primary-500/80 dark:text-white dark:hover:bg-primary-500">
							Comment
						</Button>
					</div>
				)}
			</div>
		</section>
	);
});
