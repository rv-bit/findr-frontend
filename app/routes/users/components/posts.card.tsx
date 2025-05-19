import React from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { en } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import { codeBlockOptions } from "~/config/editor.options";

import { authClient } from "~/lib/auth-client";
import { cn, formatTime } from "~/lib/utils";

import axiosInstance from "~/lib/axios.instance";
import queryClient from "~/lib/query-client";

import type { Post, User } from "~/lib/types/shared";

import { useMutatePostVote } from "~/hooks/useMutatePostVote";

import { Ellipsis, MessageCircle, Pencil, ThumbsDown, ThumbsUp, Trash2, type LucideIcon } from "lucide-react";

import HoverCardUser from "~/components/hover.card.user";
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

type DropDownActions = {
	title: string;
	show?: boolean;
	icon?: LucideIcon;
	component?: React.FC;
	items?: DropDownActions[];
	onClick?: () => void;
};

const PostsCard = React.memo(
	({
		className,
		data,
		user,
	}: React.ComponentProps<"article"> & {
		data: Post;
		user: User;
	}) => {
		const locale = en;

		const blocknoteEditor = useCreateBlockNote({
			codeBlock: {
				...codeBlockOptions,
			},
			dictionary: {
				...locale,
				placeholders: {
					...locale.placeholders,
					emptyDocument: "Body Text (optional)",
					default: "",
					heading: "",
					heading_2: "",
					heading_3: "",
					numberedListItem: "",
					bulletListItem: "",
				},
			},
		});

		const [searchParams, setSearchParams] = useSearchParams();

		const { data: session } = authClient.useSession();
		const { mutate } = useMutatePostVote({
			queryKey: ["user", user.username],
		});

		const handleUpvote = (e: React.MouseEvent) => {
			if (!session || !session.user) {
				toast.error("You need to be logged in");
				return;
			}

			mutate({ postId: data.id, type: "upvote" });
		};

		const handleDownvote = (e: React.MouseEvent) => {
			if (!session || !session.user) {
				toast.error("You need to be logged in");
				return;
			}

			mutate({ postId: data.id, type: "downvote" });
		};

		const editable = React.useMemo(() => {
			if (!session || !session.user) return false;

			return session.user.username === user.username;
		}, [session, user]);

		const time = React.useMemo(() => {
			const date = new Date(data.createdAt);
			return formatTime(date);
		}, [data.createdAt]);

		const dropDownActions: DropDownActions[] = React.useMemo(
			() => [
				{
					title: "Other",
					items: [
						{
							title: "Edit",
							icon: Pencil,
							show: editable,
						},
					],
				},
				{
					title: "Delete",
					icon: Trash2,
					show: editable,
					onClick: async () => {
						const cachedIndividualPost = queryClient.getQueryData(["post", data.id]) as Post & { user: User };
						const cachedProfilePosts = queryClient.getQueryData(["user", user.username, searchParams.get("type")]) as Post & {
							user: User;
						};
						const response = await axiosInstance.delete(`/api/v0/post/${data.id}`);
						if (response.status !== 200) {
							toast.error("Error deleting post");
							return;
						}

						if (cachedIndividualPost) {
							queryClient.invalidateQueries({
								queryKey: ["post", data.id],
							});
						}

						if (cachedProfilePosts) {
							queryClient.setQueryData(["user", user.username], (oldData: any) => {
								if (!oldData) return oldData;

								return {
									...oldData,
									pages: oldData.pages.map((page: any) => {
										return {
											...page,
											data: {
												...page.data,
												posts: page.data.posts.filter((post: any) => post.id !== data.id),
											},
										};
									}),
								};
							});
						}

						toast.success("Post deleted");
						window.location.reload();
					},
				},
			],
			[data, editable, session],
		);

		React.useEffect(() => {
			async function loadInitialHTML() {
				const blocks = await blocknoteEditor.tryParseMarkdownToBlocks(JSON.parse(data.content));
				blocknoteEditor.replaceBlocks(blocknoteEditor.document, blocks);
			}
			loadInitialHTML();
		}, [blocknoteEditor]);

		return (
			<article
				className={cn(
					"relative flex h-auto max-h-96 min-h-28 w-full flex-col justify-between gap-1.5 rounded-xl px-4 py-2 hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50",
					className,
				)}
			>
				<Link viewTransition to={`/post/${data.id}`} className="absolute inset-0" />

				<span className="flex items-center justify-between gap-1">
					<section className="flex w-fit items-center justify-start gap-1">
						<span className="relative flex items-center justify-center gap-2">
							<HoverCardUser username={user.username}>
								<Link
									viewTransition
									to={`/users/${user.username}`}
									className="group flex h-fit w-fit cursor-pointer items-center justify-start gap-2 p-0 hover:no-underline"
								>
									<Avatar className="size-6 rounded-full">
										<AvatarImage loading="lazy" src={user.image ?? ""} alt={user.username} />
										<AvatarFallback className="rounded-lg bg-sidebar-foreground/50">
											{user.username
												?.split(" ")
												.map((name) => name[0])
												.join("")}
										</AvatarFallback>
									</Avatar>

									<h1 className="text-sm break-all text-black dark:text-white">{user.username}</h1>
								</Link>
							</HoverCardUser>
						</span>
						<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
						<h2 className="text-xs text-black dark:text-white">{time}</h2>
					</section>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant={"link"}
								size="lg"
								className="relative flex h-auto items-center justify-end rounded-full p-1 hover:bg-sidebar-foreground/20 hover:text-white focus-visible:border-0 focus-visible:ring-0 dark:hover:bg-sidebar-accent dark:focus-visible:border-0 dark:focus-visible:ring-0"
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
							{dropDownActions.map((item) =>
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

										{dropDownActions.length - 1 !== dropDownActions.indexOf(item) && <DropdownMenuSeparator />}
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

											{dropDownActions.length - 1 !== dropDownActions.indexOf(item) && <DropdownMenuSeparator />}
										</DropdownMenuGroup>
									)
								),
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</span>

				<span className="flex max-h-40 flex-col items-start justify-start -space-y-0.5 overflow-hidden text-ellipsis">
					<h1 className="w-full text-xl font-bold break-all text-black dark:text-white">{data.title}</h1>
					<BlockNoteView editor={blocknoteEditor} formattingToolbar={false} slashMenu={false} sideMenu={false} editable={false} />
				</span>

				<span className="mt-1 flex items-start justify-start gap-2">
					<span
						className={cn("relative flex w-fit items-center justify-between gap-1 rounded-3xl bg-[#E5EBEE] dark:bg-sidebar-accent", {
							"bg-red-400/85 dark:bg-red-400/85": data.downvoted,
							"bg-primary-400 dark:bg-primary-400": data.upvoted,
						})}
					>
						<span className="flex items-center justify-center">
							<Button
								onClick={handleUpvote}
								className={cn(
									"group flex size-9 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4",
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
									"group flex size-9 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4",
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

					<Link
						viewTransition
						to={`/post/${data.id}`}
						className="relative flex h-9 w-fit items-center justify-start gap-1 rounded-3xl bg-[#E5EBEE] px-3 py-2 text-black hover:bg-[#75858f]/20 dark:bg-sidebar-accent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
					>
						<MessageCircle />
						<span className="text-sm text-black dark:text-white">{data.commentsCount}</span>
					</Link>
				</span>
			</article>
		);
	},
);

export default PostsCard;
