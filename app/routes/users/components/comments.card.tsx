import React from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { cn, formatTime } from "~/lib/utils";

import type { Session } from "~/lib/auth-client";
import type { Comment, User } from "~/lib/types/shared";

import { useMutateCommentVote } from "~/hooks/useMutateCommentVote";

import { Button } from "~/components/ui/button";

import { BiDownvote, BiSolidDownvote, BiSolidUpvote, BiUpvote } from "react-icons/bi";

import { MessageCircle } from "lucide-react";

import HoverCardUser from "~/components/hover.card.user";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { types } from "../shared/constants";

type Props = {
	comment: Comment;
	user: User;
	session: Session | null;
};

const CommentsCard = React.memo(({ className, comment, user, ...props }: React.ComponentProps<"article"> & Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentType = searchParams.get("type") ?? types[0].query;

	const { mutate } = useMutateCommentVote({
		queryKey: ["user", user.username, currentType],
	});

	const handleUpvote = (e: React.MouseEvent) => {
		e.preventDefault();

		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "upvote" });
	};

	const handleDownvote = (e: React.MouseEvent) => {
		e.preventDefault();

		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "downvote" });
	};

	const createdAt = React.useMemo(() => {
		return formatTime(comment.createdAt);
	}, [comment.createdAt]);

	return (
		<article
			className={cn(
				"relative flex h-auto max-h-96 min-h-28 w-full flex-col justify-between gap-3 p-4 px-5 hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50",
				className,
			)}
		>
			<Link to={`/comments/${comment.id}`} className="absolute inset-0" />

			<span className="flex h-full cursor-pointer flex-col items-start justify-start gap-2 overflow-hidden text-ellipsis">
				<section id="comment-header" className="flex w-full flex-col items-center justify-start space-y-0.5 text-black dark:text-white">
					<span className="relative flex w-full items-center justify-start gap-1">
						<span className="flex w-fit items-center justify-start gap-2">
							<Avatar className="size-5 rounded-full">
								{/* <AvatarImage loading="lazy" src={data.user.image ?? ""} alt={data.user.username} /> */}
								<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]"></AvatarFallback>
							</Avatar>
							<h1 className="w-fit text-xs break-all">
								<span>f/</span>
								{comment.post.slug}
							</h1>
						</span>
						<span className="my-0 inline-block"> • </span>
						<Link
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							to={`/post/${comment.postId}`}
							className="group flex h-fit w-fit cursor-pointer items-center justify-start gap-1 p-0 hover:no-underline"
						>
							<h1 className="text-xs break-all text-black/50 hover:text-primary-300 hover:underline dark:text-white/50 hover:dark:text-primary-300">
								{comment.post.title}
							</h1>
						</Link>
					</span>
					<span className="relative ml-15 flex w-full items-center justify-start gap-1">
						<HoverCardUser username={user.username}>
							<Link
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								to={`/users/${user.username}`}
								className="group flex h-fit w-fit cursor-pointer items-center justify-start gap-1 p-0 hover:no-underline"
							>
								<h1 className="text-xs break-all text-black group-hover:text-primary-300 dark:text-white group-hover:dark:text-primary-300">
									{user.username}
								</h1>
							</Link>
						</HoverCardUser>

						<span id="poster-info" className="flex text-xs break-all text-black/50 dark:text-white/50">
							{comment.repliedTo ? (
								<span className="flex w-auto gap-1">
									replied to{" "}
									<HoverCardUser username={comment.repliedTo}>
										<Link
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											to={`/users/${comment.repliedTo}`}
											className="group flex h-fit w-fit cursor-pointer items-center justify-start gap-1 p-0 hover:no-underline"
										>
											<h1 className="text-xs break-all text-black group-hover:text-primary-300 dark:text-white group-hover:dark:text-primary-300">
												{comment.repliedTo}
											</h1>
										</Link>
									</HoverCardUser>
								</span>
							) : (
								<span>commented</span>
							)}
						</span>
						<span id="time-span" className="text-xs text-black/50 dark:text-white/50">
							{createdAt}
						</span>
					</span>
				</section>

				<section id="comment-body" className="mt-1 ml-5 flex w-full flex-col items-start justify-start gap-1">
					<span className="w-full pl-[10px]">
						<p className="text-sm break-all text-black dark:text-white">{comment.text}</p>
					</span>

					<span className="relative flex items-center justify-start gap-1">
						<span className={cn("flex w-fit items-center justify-between")}>
							<span className="flex items-center justify-center">
								<Button
									onClick={handleUpvote}
									className={cn(
										"group flex size-8 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-auto",
									)}
								>
									{comment.upvoted ? (
										<BiSolidUpvote
											size={19}
											className={cn("group-hover:text-white", {
												"fill-primary-300 dark:fill-primary-300": comment.upvoted,
											})}
										/>
									) : (
										<BiUpvote size={19} className={cn("group-hover:text-primary-400", {})} />
									)}
								</Button>
							</span>

							<h1
								className={cn("text-sm text-black/70 dark:text-white", {
									"text-white": comment.upvoted || comment.downvoted,
								})}
							>
								{comment.likesCount}
							</h1>

							<span className="flex items-center justify-center">
								<Button
									onClick={handleDownvote}
									className={cn(
										"group flex size-8 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-auto",
									)}
								>
									{comment.downvoted ? (
										<BiSolidDownvote
											size={19}
											className={cn("group-hover:text-white", {
												"fill-red-400 dark:fill-red-400": comment.downvoted,
											})}
										/>
									) : (
										<BiDownvote size={19} className={cn("group-hover:text-red-400", {})} />
									)}
								</Button>
							</span>

							<Link
								to={`/comments/${comment.id}`}
								className="flex h-8 w-fit items-center justify-center gap-1 rounded-3xl bg-transparent px-3 py-2 text-black shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
							>
								<MessageCircle />
								<span className="text-sm text-black dark:text-white">Reply</span>
							</Link>
						</span>
					</span>
				</section>
			</span>
		</article>
	);
});

export default CommentsCard;
