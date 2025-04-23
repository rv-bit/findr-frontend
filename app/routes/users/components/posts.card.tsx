import { codeBlockPlugin, headingsPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import React from "react";
import { useParams } from "react-router";
import { ClientOnly } from "remix-utils/client-only";

import { cn, formatTime } from "~/lib/utils";

import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

import { useMutateVote } from "../hooks/useMutateVote";

import { toast } from "sonner";
import { authClient } from "~/lib/auth";
import type { Post } from "../profile.types";

export default function PostsCard({ data }: { data: Post }) {
	const { data: session } = authClient.useSession();

	const userId = useParams().userId as string;
	const { mutate } = useMutateVote();

	const handleUpvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ postId: data.id, userId, type: "upvote" });
	};

	const handleDownvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ postId: data.id, userId, type: "downvote" });
	};

	const time = React.useMemo(() => {
		const date = new Date(data.createdAt);
		return formatTime(date);
	}, [data.createdAt]);

	return (
		<article className="flex h-auto max-h-96 min-h-28 w-full flex-col justify-between gap-3 rounded-xl px-4 py-2 hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50">
			<span className="flex items-center justify-start gap-1">
				<span className="flex items-center justify-center gap-2">
					<Avatar className="size-6 rounded-full">
						<AvatarImage src={"https://cdn.discordapp.com/avatars/1325267844698734698/fdff993870a62c29081851408ec63b76.webp?size=32"} alt={"df"} className="rounded-full" />
						<AvatarFallback className="rounded-full">DF</AvatarFallback>
					</Avatar>
					<h1 className="text-sm text-black dark:text-white">{data.username}</h1>
				</span>
				<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
				<h2 className="text-xs text-black dark:text-white">{time}</h2>
			</span>

			<span className="flex h-full flex-col items-start justify-start gap-1 overflow-hidden text-ellipsis">
				<h1 className="w-full text-lg font-bold break-all text-black dark:text-white">{data.title}</h1>
				<ClientOnly>
					{() => (
						<MDXEditor
							markdown={data.content}
							plugins={[
								quotePlugin(),
								listsPlugin(),
								codeBlockPlugin(),
								headingsPlugin({
									allowedHeadingLevels: [1, 2, 3],
								}),
								quotePlugin(),
								thematicBreakPlugin(),
								markdownShortcutPlugin(),
							]}
							className="w-full overflow-hidden text-ellipsis"
							contentEditableClassName="text-ellipsis line-clamp-10 text-gray-500 dark:text-gray-400 w-full"
							readOnly={true}
						/>
					)}
				</ClientOnly>
			</span>

			<span className="flex items-start justify-start gap-2">
				<span
					className={cn("flex w-fit items-center justify-between gap-1 rounded-3xl bg-[#E5EBEE] dark:bg-sidebar-accent", {
						"bg-red-400/85 dark:bg-red-400/85": data.downvoted,
						"bg-primary-400 dark:bg-primary-400": data.upvoted,
					})}
				>
					<span className="flex items-center justify-center">
						<Button
							onClick={handleUpvote}
							className={cn(
								"group flex items-center justify-center gap-1 rounded-full bg-transparent p-2 px-3 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4",
								{
									"text-white hover:bg-[#75858f]/50 dark:hover:bg-[#333a3e]/40": data.upvoted || data.downvoted,
								},
							)}
						>
							<ThumbsUp
								className={cn("group-hover:text-primary-400", {
									"group-hover:text-white": data.upvoted || data.downvoted,
								})}
							/>
						</Button>
					</span>

					<h1
						className={cn("text-sm text-black/70 dark:text-white", {
							"text-white": data.upvoted || data.downvoted,
						})}
					>
						{data.likesCount}
					</h1>

					<span className="flex items-center justify-center">
						<Button
							onClick={handleDownvote}
							className={cn(
								"group flex items-center justify-center gap-1 rounded-full bg-transparent p-2 px-3 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4",
								{
									"text-white hover:bg-[#75858f]/50 dark:hover:bg-[#333a3e]/40": data.upvoted || data.downvoted,
								},
							)}
						>
							<ThumbsDown
								className={cn("group-hover:text-red-400/85", {
									"group-hover:text-white": data.upvoted || data.downvoted,
								})}
							/>
						</Button>
					</span>
				</span>

				<Button
					disabled={true}
					className="flex w-fit items-center justify-start gap-1 rounded-3xl bg-[#E5EBEE] px-3 text-black hover:bg-[#75858f]/20 dark:bg-sidebar-accent dark:text-white dark:hover:bg-[#333a3e]"
				>
					<MessageCircle />
					<span className="text-sm text-black dark:text-white">{data.commentsCount}</span>
				</Button>
			</span>
		</article>
	);
}
