import editor_stylesheet from "~/styles/card.posts.mdx.css?url";
import type { Route } from "./+types/profile";

import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router";

import axiosInstance from "~/lib/axios-instance";

import { cn } from "~/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import type { Comments, Post, User } from "~/routes/users/profile.types";

import CommentsCard from "./components/comments.card";
import PostsCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export async function loader({ params }: Route.LoaderArgs) {
	const { username } = params;

	if (!username) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const response = await axiosInstance.get(`/api/v0/users/${username}`);
	if (response.status !== 200) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const data = response.data.data;
	if (!data) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const user = data as User;
	return {
		user,
	};
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	const serverData = await serverLoader();

	return {
		...serverData,
	};
}

export function HydrateFallback() {
	return <div>Loading...</div>;
}

const types: {
	title: string;
	url: string;
	queryKey: string;
	query: string;
	icon?: LucideIcon;
	disabled?: boolean;
}[] = [
	{
		title: "Overview",
		url: "/users",
		queryKey: "type",
		query: "overview",
	},
	{
		title: "Posts",
		url: "/users",
		queryKey: "type",
		query: "posts",
	},
	{
		title: "Comments",
		url: "/users",
		queryKey: "type",
		query: "comments",
	},
];

const sortOptions: {
	title: string;
	value: string;
}[] = [
	{
		title: "Hot",
		value: "hot",
	},
	{
		title: "New",
		value: "new",
	},
	{
		title: "Top",
		value: "top",
	},
];

export default function Index() {
	const { user } = useLoaderData<typeof loader>();

	const location = useLocation();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();

	const [currentSortOption, setCurrentSortOption] = React.useState("new");

	const inViewportRef = React.useRef<HTMLDivElement>(null);
	const navRef = React.useRef<HTMLDivElement>(null);
	const navGoRightRef = React.useRef<HTMLButtonElement>(null);
	const navGoLeftRef = React.useRef<HTMLButtonElement>(null);

	const fetchData = React.useCallback(
		async (page: number) => {
			const { data } = await axiosInstance.get(`/api/v0/users/getData/${user.username}?page=${page}&type=${searchParams.get("type")}`);
			return data;
		},
		[user],
	);

	const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
		staleTime: 1000 * 60 * 1, // 1 minute
		queryKey: ["userData", user.id, searchParams.get("type")],
		initialPageParam: 1,
		queryFn: ({ pageParam }) => fetchData(pageParam),
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const handleScrollAndResize = () => {
		if (!navRef.current || !navGoRightRef.current || !navGoLeftRef.current) return;

		const scrollLeft = navRef.current.scrollLeft;
		const scrollWidth = navRef.current.scrollWidth;
		const clientWidth = navRef.current.clientWidth;

		if (scrollLeft > 0) {
			navGoLeftRef.current.classList.remove("hidden");
		} else {
			navGoLeftRef.current.classList.add("hidden");
		}

		if (scrollLeft + clientWidth < scrollWidth) {
			navGoRightRef.current.classList.remove("hidden");
		} else {
			navGoRightRef.current.classList.add("hidden");
		}
	};

	const isActive = React.useMemo(
		() => (url: string, queryKey: string, query: string) => {
			const pathname = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
			const params = searchParams.get(queryKey);

			const isQueryMatch = params === query;
			return pathname === url && isQueryMatch;
		},
		[location, searchParams],
	);

	React.useEffect(() => {
		if (!navRef.current) return;
		handleScrollAndResize();

		navRef.current.addEventListener("scroll", handleScrollAndResize);
		window.addEventListener("resize", handleScrollAndResize);

		return () => {
			navRef.current?.removeEventListener("scroll", handleScrollAndResize);
			window.removeEventListener("resize", handleScrollAndResize);
		};
	}, []);

	React.useEffect(() => {
		const params = searchParams.get("type");
		const paramExists = types.some((type) => type.query === params);

		if (!params) {
			setSearchParams({
				type: "overview",
			});
		}

		if (!paramExists) {
			setSearchParams({
				type: "overview",
			});
		}

		return () => {
			if (navRef.current) {
				navRef.current.scrollLeft = 0;
			}
		};
	}, [searchParams]);

	React.useEffect(() => {
		if (!inViewportRef.current) return;

		if (status === "success") {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						fetchNextPage();
					}
				},
				{ threshold: 1 },
			);

			observer.observe(inViewportRef.current);
			return () => {
				observer.disconnect();
			};
		}
	}, [status, fetchNextPage, inViewportRef]);

	return (
		<main className="mx-auto flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="flex w-full max-w-[85rem] flex-col gap-5 px-10 pt-5 max-sm:px-4">
				<div className="flex items-center justify-between gap-4">
					<span className="size-fit rounded-full bg-sidebar-foreground/20 p-1 dark:bg-sidebar-accent">
						<Avatar className="size-18 rounded-full">
							<AvatarImage src={`${import.meta.env.VITE_CLOUD_FRONT_URL}/${user.image}`} alt={user.username} />
							<AvatarFallback className="rounded-lg bg-sidebar-foreground/50">
								{user.username
									?.split(" ")
									.map((name) => name[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
					</span>

					<div className="flex w-full flex-col gap-1">
						<span className="flex flex-col -space-y-1 leading-tight">
							<p className="text-lg leading-tight font-semibold break-all text-black dark:text-white">{user.username}</p>
							<p className="text-sm leading-tight font-light break-all text-black dark:text-white">u/{user.username}</p>
						</span>
						<p className="text-sm break-all text-neutral-500 dark:text-neutral-400">{user.about_description}</p>
					</div>
				</div>
				<section className="flex w-full flex-col gap-2 border-b border-sidebar-border pb-5">
					<div className="relative w-full">
						<nav ref={navRef} className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible">
							{types.map((action, index) => (
								<Button
									key={index}
									variant={"link"}
									disabled={action.disabled}
									onClick={(e) => {
										e.preventDefault();

										navigate(action.url, {
											replace: true,
										});
										setSearchParams({
											[action.queryKey!]: action.query!,
										});
									}}
									className={cn(
										"group relative h-auto min-w-fit shrink-0 items-center justify-center rounded-full px-4 py-3 hover:no-underline",
										isActive(action.url, action?.queryKey, action?.query)
											? "bg-sidebar-foreground/50 dark:bg-sidebar-accent"
											: "hover:bg-sidebar-accent-foreground/20 dark:hover:bg-sidebar-accent/50",
									)}
								>
									{action.icon && <action.icon />}
									<h1
										className={cn(
											"inline-flex text-black",
											isActive(action.url, action?.queryKey, action?.query)
												? "text-black dark:text-white"
												: "group-hover:text-black/50 dark:text-[#8BA2AE] dark:group-hover:text-white/80",
										)}
									>
										{action.title}
									</h1>
								</Button>
							))}
						</nav>

						<div className="absolute top-0 left-0 bg-linear-to-l from-transparent from-0% to-sidebar to-30% pr-3">
							<button
								ref={navGoLeftRef}
								onClick={() => {
									if (navRef.current) {
										navRef.current.scrollBy({ left: -100, behavior: "smooth" });
									}
								}}
								className="flex size-11 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
							>
								<ChevronLeft className="h-6 w-6 text-black dark:text-white" />
							</button>
						</div>

						<div className="absolute top-0 right-0 bg-linear-to-r from-transparent from-0% to-sidebar to-30% pl-3">
							<button
								ref={navGoRightRef}
								onClick={() => {
									if (navRef.current) {
										navRef.current.scrollBy({ left: 100, behavior: "smooth" });
									}
								}}
								className="flex size-11 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
							>
								<ChevronRight className="h-6 w-6 text-black dark:text-white" />
							</button>
						</div>
					</div>

					<Select defaultValue={currentSortOption} onValueChange={setCurrentSortOption}>
						<SelectTrigger className="min-h-5 w-fit min-w-6 gap-1 rounded-full border-0 pl-4 text-black shadow-none focus-visible:border-0 focus-visible:ring-0 data-[placeholder]:text-black dark:dark:bg-transparent dark:text-white dark:dark:hover:bg-sidebar-accent/60 dark:focus-visible:border-0 dark:focus-visible:ring-0 dark:data-[placeholder]:text-white">
							<SelectValue placeholder="Theme" />
						</SelectTrigger>
						<SelectContent className="w-20 rounded-sm border-0 p-0 shadow-none dark:bg-modal">
							<h1 className="px-2 pt-2 pb-3 text-sm font-semibold text-black dark:text-white">Sort by</h1>
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value} className="cursor-pointer py-2 text-left hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent">
									{option.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</section>

				<section className="flex w-full flex-col gap-2">
					{status === "pending" ? (
						<p>Loading...</p>
					) : (
						<div className="flex w-full flex-col gap-1">
							{data?.pages.length === 0 && (
								<p className="text-center text-sm font-semibold text-black dark:text-white">
									No results found for <span className="text-red-500">{searchParams.get("type")}</span>
								</p>
							)}

							{data?.pages.map((group, i) => (
								<React.Fragment key={i}>
									{searchParams.get("type") === "overview" ? (
										<React.Fragment>
											{group.data.posts
												.sort((a: Post, b: Post) => {
													if (currentSortOption === "new") {
														return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
													} else if (currentSortOption === "top") {
														return b.likesCount - a.likesCount;
													} else {
														return 0;
													}
												})
												.map((post: Post) => (
													<PostsCard
														key={post.id}
														content={post.content}
														username={user.username}
														title={post.title}
														likesCount={post.likesCount}
														commentsCount={post.commentsCount}
														createdAt={post.createdAt}
														onHandleUpvote={() => {
															console.log("Upvote clicked");
														}}
														onHandleDownvote={() => {
															console.log("Downvote clicked");
														}}
													/>
												))}
											{group.data.comments
												.sort((a: Comments, b: Comments) => {
													if (currentSortOption === "new") {
														return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
													} else if (currentSortOption === "top") {
														return 0; // it should have been sorted by how many likes a comment has, but we don't have that data yet
													} else {
														return 0;
													}
												})
												.map((comment: Comments) => (
													<CommentsCard
														key={comment.id}
														content={comment.text || ""}
														username={user.username}
														title={comment.postTitle || "Comment"}
														createdAt={comment.createdAt}
													/>
												))}
										</React.Fragment>
									) : searchParams.get("type") === "comments" ? (
										group.data
											.sort((a: Comments, b: Comments) => {
												if (currentSortOption === "new") {
													return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
												} else if (currentSortOption === "top") {
													return 0; // it should have been sorted by how many likes a comment has, but we don't have that data yet
												} else {
													return 0;
												}
											})
											.map((comment: Comments) => (
												<CommentsCard
													key={comment.id}
													content={comment.text || ""}
													username={user.username}
													title={comment.postTitle || "Comment"}
													createdAt={comment.createdAt}
												/>
											))
									) : searchParams.get("type") === "posts" ? (
										group.data
											.sort((a: Post, b: Post) => {
												if (currentSortOption === "new") {
													return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
												} else if (currentSortOption === "top") {
													return b.likesCount - a.likesCount;
												} else {
													return 0;
												}
											})
											.map((post: Post) => (
												<PostsCard
													key={post.id}
													content={post.content}
													username={user.username}
													title={post.title}
													likesCount={post.likesCount}
													commentsCount={post.commentsCount}
													createdAt={post.createdAt}
													onHandleUpvote={() => {
														console.log("Upvote clicked");
													}}
													onHandleDownvote={() => {
														console.log("Downvote clicked");
													}}
												/>
											))
									) : null}
								</React.Fragment>
							))}
							{isFetching && <p>Loading...</p>}
							{hasNextPage && <div ref={inViewportRef}>{isFetchingNextPage && <p>Loading more...</p>}</div>}
							{error && <div>Error: {error.message}</div>}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
