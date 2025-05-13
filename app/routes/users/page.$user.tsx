import editor_stylesheet from "~/styles/card.posts.unfiltered.mdx.css?url";
import type { Route } from "./+types/page.$user";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { useLoaderData, useSearchParams } from "react-router";

import { authClient } from "~/lib/auth-client";
import axiosInstance from "~/lib/axios.instance";

import type { Comment, Post, User } from "~/lib/types/shared";

import Loading from "~/icons/loading";

import { sortOptions, types } from "./shared/constants";

import CommentsCard from "./components/comments.card";
import HeaderCard from "./components/header.card";
import PostsCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ params }: Route.MetaArgs) {
	const username = params.username;
	return [{ title: `u/${username}` }, { name: "description", content: `Findr ${username} User Profile` }];
}

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
	return (
		<div className="flex w-full items-center justify-center">
			<Loading className="size-24" />
		</div>
	);
}

export default function Index() {
	const { user } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: session } = authClient.useSession();

	const currentType = searchParams.get("type");
	const currentSortOption = searchParams.get("sort") || sortOptions[0].value;

	const inViewportRef = React.useRef<HTMLDivElement | null>(null);

	const fetchData = React.useCallback(
		async (page: number) => {
			const { data } = await axiosInstance.get(`/api/v0/users/getData/${user.username}?page=${page}&type=${currentType}`);
			return data;
		},
		[user],
	);

	const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
		staleTime: 1000 * 60 * 2, // 2 minutes
		queryKey: ["user", user.username, currentType],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchData(pageParam);
		},
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const dataLength = React.useMemo(() => {
		if (!data || data.pages.length === 0) {
			return false;
		}

		return data.pages.some((group) => {
			if (!group || !group.data) {
				return false;
			}

			if (currentType === "overview") {
				return (group.data.posts && group.data.posts.length > 0) || (group.data.comments && group.data.comments.length > 0);
			} else if (currentType === "posts" || currentType === "comments") {
				return Array.isArray(group.data) && group.data.length > 0;
			}
			return false;
		});
	}, [data, currentSortOption]);

	const sortingFn = React.useMemo(() => {
		const sortOption = sortOptions.find((option) => option.value === currentSortOption);
		return sortOption?.sortingFn;
	}, [currentSortOption]);

	const flattenedItems = React.useMemo(() => {
		if (!data) {
			return [];
		}

		if (currentType !== "overview") {
			// For posts and comments, directly flatten and sort
			return data.pages
				.reduce((acc, group) => {
					return group.data && Array.isArray(group.data) ? [...acc, ...group.data] : acc;
				}, [])
				.sort(sortingFn);
		}

		// For overview, combine and mark posts and comments
		const combinedItems: { type: "post" | "comment"; item: Post | Comment }[] = [];
		data.pages.forEach((group) => {
			if (group.data.posts && Array.isArray(group.data.posts)) {
				group.data.posts.forEach((post: Post) => {
					combinedItems.push({ type: "post", item: post });
				});
			}
			if (group.data.comments && Array.isArray(group.data.comments)) {
				group.data.comments.forEach((comment: Comment) => {
					combinedItems.push({ type: "comment", item: comment });
				});
			}
		});

		return combinedItems.sort((a, b) => sortingFn!(a.item, b.item));
	}, [data, sortingFn, currentSortOption]);

	const virtualizer = useWindowVirtualizer({
		count: flattenedItems.length,
		estimateSize: () => 250,
		paddingEnd: currentType === "comments" ? 20 : 50,
		overscan: 5,
	});
	const virtualItems = virtualizer.getVirtualItems();

	React.useEffect(() => {
		const paramExists = types.some((type) => type.query === currentType);

		if (!currentType) {
			setSearchParams((prev) => {
				prev.set("type", types[0].query);
				return prev;
			});
		}

		if (!paramExists) {
			setSearchParams((prev) => {
				prev.set("type", types[0].query);
				return prev;
			});
		}

		return () => {};
	}, [currentType]);

	React.useEffect(() => {
		const currentRef = inViewportRef.current;
		if (!currentRef) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage().catch(console.error);
				}
			},
			{
				threshold: 0.1,
				rootMargin: "100px 0px",
			},
		);

		observer.observe(currentRef);
		return () => {
			observer.disconnect();
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<main className="mx-auto flex w-screen flex-col items-center justify-start overflow-hidden px-0 pt-5 lg:w-full lg:px-10">
			<div className="flex w-full max-w-[85rem] flex-col">
				<HeaderCard user={user} session={session} className="px-5" />

				<section id="content" className="flex h-full w-full flex-col gap-2">
					{status === "pending" ? (
						<div className="my-20 flex w-full items-center justify-center">
							<Loading className="size-24" />
						</div>
					) : (
						<div className="flex w-full flex-col">
							{!dataLength ? (
								<p className="my-20 text-center text-xl font-semibold text-black dark:text-white">
									No results found for <span className="text-red-500">{currentType}</span>
								</p>
							) : (
								<>
									<div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
											}}
										>
											{virtualItems.map((virtualRow) => {
												const item = flattenedItems[virtualRow.index];
												if (!item) return null;

												if (currentType === "overview") {
													return (
														<div
															key={`${item.type}-${item.item.id}`}
															data-index={virtualRow.index}
															ref={virtualizer.measureElement}
														>
															{item.type === "post" ? (
																<PostsCard className="my-1" data={item.item} user={user} />
															) : (
																<CommentsCard comment={item.item} user={user} session={session} />
															)}
															<hr className="w-full border-t-0 border-b border-sidebar-border" />
														</div>
													);
												} else {
													return (
														<div key={item.id} data-index={virtualRow.index} ref={virtualizer.measureElement}>
															{currentType === "posts" ? (
																<PostsCard className="my-1" data={item} user={user} />
															) : (
																<CommentsCard comment={item} user={user} session={session} />
															)}
															<hr className="w-full border-t-0 border-b border-sidebar-border" />
														</div>
													);
												}
											})}
										</div>
									</div>

									<div ref={inViewportRef}>
										{isFetchingNextPage && (
											<div className="flex w-full items-center justify-center">
												<Loading className="size-24" />
											</div>
										)}
										{hasNextPage && !isFetchingNextPage && <div className="h-10 w-full" />}
									</div>
								</>
							)}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
