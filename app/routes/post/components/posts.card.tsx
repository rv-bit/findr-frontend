import { codeBlockPlugin, headingsPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import React from "react";
import { Link, useNavigate } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { toast } from "sonner";

import { authClient } from "~/lib/auth";
import { cn, formatTime } from "~/lib/utils";

import axiosInstance from "~/lib/axios-instance";
import queryClient from "~/lib/query/query-client";

import type { Post, User } from "~/lib/types/shared";

import { useMutateVote } from "~/hooks/useMutateVote";

import { ArrowLeft, BellDot, Bookmark, Cake, Ellipsis, Flag, MessageCircle, ThumbsDown, ThumbsUp, type LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";

type DropDownActions = {
	title: string;
	show?: boolean;
	icon?: LucideIcon;
	component?: React.FC;
	items?: DropDownActions[];
	onClick?: () => void;
};

export default function PostCard({
	className,
	data,
	onCommentIconClick,
}: React.ComponentProps<"article"> & {
	data: Post & {
		user: User;
	};
	onCommentIconClick: () => void;
}) {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { mutate } = useMutateVote({
		queryKey: ["post", data.id],
	});

	const handleUpvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ postId: data.id, type: "upvote" });
	};

	const handleDownvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ postId: data.id, type: "downvote" });
	};

	const editable = React.useMemo(() => {
		if (!session || !session.user) {
			return false;
		}

		return data.user.username === session.user.username;
	}, [session, data]);

	const time = React.useMemo(() => {
		const date = new Date(data.createdAt);
		return formatTime(date);
	}, [data.createdAt]);

	const dropDownActions: DropDownActions[] = React.useMemo(
		() => [
			{
				title: "Options",
				items: [
					{
						title: "Follow User",
						icon: BellDot,
						show: (session && session.user.username !== data.user.username) || false,
					},
					{
						title: "Save",
						icon: Bookmark,
						show: true,
					},
					{
						title: "Report",
						icon: Flag,
						show: true,
					},
				],
			},
			{
				title: "Edit",
				show: editable,
				items: [
					{
						title: "Edit Post",
						icon: BellDot,
						show: editable,
						onClick: () => {
							navigate(`/post/${data.slug}/edit`);
						},
					},
					{
						title: "Delete Post",
						icon: BellDot,
						show: editable,
						onClick: async () => {
							const cachedData = queryClient.getQueryData(["post", data.id]) as Post & { user: User };
							const response = await axiosInstance.delete(`/api/v0/post/${data.id}`);
							if (response.status !== 200) {
								toast.error("Error deleting post");
								return;
							}

							if (cachedData) {
								queryClient.invalidateQueries({
									queryKey: ["post", data.id],
								});
							}

							toast.success("Post deleted");
							navigate("/");
						},
					},
				],
			},
		],
		[data, editable, session],
	);

	return (
		<article className={cn("relative flex h-auto flex-col justify-between gap-6", className)}>
			<div className="flex flex-col justify-between gap-1">
				<span className="flex items-center justify-between gap-1">
					<section className="flex items-center justify-start gap-1 2xl:relative">
						<Button
							size={"lg"}
							className="size-8 rounded-full bg-sidebar-foreground/40 p-0 hover:bg-sidebar-foreground/50 max-sm:hidden 2xl:absolute 2xl:-left-10 dark:bg-sidebar-accent/50 dark:text-white dark:hover:bg-sidebar-foreground/20"
							onClick={() => {
								navigate(-1);
							}}
						>
							<ArrowLeft className="size-4" />
						</Button>
						<span className="flex items-center justify-start gap-2">
							<Avatar className="size-9 rounded-full">
								<AvatarImage
									loading="lazy"
									src={`${data.user.image?.startsWith("http") ? data.user.image : `${import.meta.env.VITE_CLOUD_FRONT_URL}/${data.user.image}`}`}
									alt={data.user.username}
								/>
								<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]">
									{data.user.username
										?.split(" ")
										.map((name) => name[0])
										.join("")}
								</AvatarFallback>
							</Avatar>

							<span className="flex flex-col justify-start gap-0">
								<h1 className="text-sm break-all text-black dark:text-white">
									<span>f/</span>
									{data.slug}
								</h1>
								<HoverCard>
									<HoverCardTrigger asChild>
										<Link
											to={`/users/${data.user.username}`}
											className="group flex w-fit cursor-pointer items-center justify-start gap-1"
										>
											<h2 className="text-xs break-all text-neutral-500 group-hover:dark:text-primary-300">
												{data.user.username}
											</h2>
										</Link>
									</HoverCardTrigger>
									<HoverCardContent align="start" className="flex flex-col gap-2 rounded-2xl border-none dark:bg-modal">
										<div className="flex w-full items-center justify-start gap-2">
											<Avatar className="size-12 rounded-full">
												<AvatarImage
													loading="lazy"
													src={`${data.user.image?.startsWith("http") ? data.user.image : `${import.meta.env.VITE_CLOUD_FRONT_URL}/${data.user.image}`}`}
													alt={data.user.username}
												/>
												<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]">
													{data.user.username
														?.split(" ")
														.map((name) => name[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col justify-start gap-1">
												<span className="flex flex-col justify-start -space-y-2">
													<Link
														to={`/users/${data.user.username}`}
														className="group flex cursor-pointer items-center justify-start gap-1"
													>
														<h1 className="text-lg break-all text-black group-hover:text-primary-300 group-hover:underline dark:text-white group-hover:dark:text-primary-300">
															{data.user.username}
														</h1>
													</Link>
													<span className="text-xs break-all text-black/50 dark:text-neutral-500">
														<span>u/</span>
														{data.user.username}
													</span>
												</span>

												<div className="flex gap-1 text-xs break-all text-black/50 dark:text-neutral-500">
													<Cake className="size-4" />
													{new Date(data.user.createdAt).toLocaleDateString("en-US", {
														year: "numeric",
														month: "long",
														day: "numeric",
													})}
												</div>
											</div>
										</div>
										<span className="text-xs break-all text-black/50 dark:text-neutral-500">{data.user.about_description}</span>

										<span className="flex items-center justify-start gap-2">
											<span className="flex flex-col items-start justify-start">
												<h1 className="font-bricolage text-base font-semibold break-all text-black/50 dark:text-neutral-500">
													{data.user.postsCount}
												</h1>
												<p className="font-bricolage text-xs break-all text-black/50 dark:text-neutral-500">Posts</p>
											</span>
											<span className="flex flex-col items-start justify-start">
												<h1 className="font-bricolage text-base font-semibold break-all text-black/50 dark:text-neutral-500">
													{data.user.commentsCount}
												</h1>
												<p className="font-bricolage text-xs break-all text-black/50 dark:text-neutral-500">Comments</p>
											</span>
										</span>
									</HoverCardContent>
								</HoverCard>
							</span>
						</span>
						<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
						<h2 className="text-xs text-black dark:text-white">{time}</h2>
					</section>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant={"link"}
								size="lg"
								className="flex h-auto items-center justify-end rounded-full p-1 hover:bg-sidebar-foreground/20 hover:text-white focus-visible:border-0 focus-visible:ring-0 dark:hover:bg-sidebar-accent dark:focus-visible:border-0 dark:focus-visible:ring-0"
							>
								<Ellipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="mt-3.5 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-none dark:bg-modal"
							side={"bottom"}
							align="end"
							sideOffset={4}
						>
							{dropDownActions.map((item, index) =>
								item.items ? (
									<DropdownMenuGroup key={item.title}>
										{item.items?.map(
											(action) =>
												action.show && (
													<DropdownMenuItem
														key={action.title}
														onClick={(e) => {
															e.preventDefault();

															if (action.onClick) {
																action.onClick();
															}
														}}
														className="group h-auto w-full px-3 py-2 text-left hover:cursor-pointer"
													>
														{action.component ? (
															<action.component />
														) : (
															<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
																{action.icon && <action.icon />}
																<h1>{action.title}</h1>
															</span>
														)}
													</DropdownMenuItem>
												),
										)}

										{dropDownActions.length - 1 !== index && dropDownActions[index + 1].show && <DropdownMenuSeparator />}
									</DropdownMenuGroup>
								) : (
									item.show && (
										<DropdownMenuGroup key={item.title}>
											<DropdownMenuItem
												onClick={(e) => {
													e.preventDefault();

													if (item.onClick) {
														item.onClick();
													}
												}}
												className="group w-full px-3 py-2 text-left hover:cursor-pointer"
											>
												{item.component ? (
													<item.component />
												) : (
													<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
														{item.icon && <item.icon />}
														<h1>{item.title}</h1>
													</span>
												)}
											</DropdownMenuItem>

											{dropDownActions.length - 1 !== index && <DropdownMenuSeparator />}
										</DropdownMenuGroup>
									)
								),
							)}
						</DropdownMenuContent>
					</DropdownMenu>
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
								contentEditableClassName="text-ellipsis text-gray-500 dark:text-gray-400 w-full"
								readOnly={true}
							/>
						)}
					</ClientOnly>
				</span>
			</div>

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
					onClick={() => {
						onCommentIconClick();
					}}
					className="flex h-9 w-fit items-center justify-start gap-1 rounded-3xl bg-[#E5EBEE] px-3 py-2 text-black hover:bg-[#75858f]/20 dark:bg-sidebar-accent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
				>
					<MessageCircle />
					<span className="text-sm text-black dark:text-white">{data.commentsCount}</span>
				</Button>
			</span>
		</article>
	);
}
