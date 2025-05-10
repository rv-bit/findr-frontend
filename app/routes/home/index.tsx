import editor_stylesheet from "~/styles/card.posts.unfiltered.mdx.css?url";
import type { Route } from "./+types/index";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { useSearchParams } from "react-router";

import axiosInstance from "~/lib/axios-instance";

import type { Post } from "~/lib/types/shared";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import Loading from "~/icons/loading";

import PostsCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({ location }: Route.MetaArgs) {
	const searchFeed = new URLSearchParams(location.search).get("feed") || "home";
	const feed = searchFeed === "home" ? "Findr" : "f/" + searchFeed;

	return [
		{ title: feed },
		{
			name: "description",
			content: `Findr - ${feed} feed`,
		},
	];
}

const sortOptions: {
	title: string;
	value: string;
	sortingFn?: (a: Post, b: Post) => number;
}[] = [
	{
		title: "Newest",
		value: "newest",
		sortingFn: (a: Post, b: Post) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		},
	},
	{
		title: "Oldest",
		value: "oldest",
		sortingFn: (a: Post, b: Post) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		},
	},
	{
		title: "Top",
		value: "top",
		sortingFn: (a: Post, b: Post) => {
			return b.likesCount - a.likesCount;
		},
	},
];

export default function Index() {
	const [searchParams, setSearchParams] = useSearchParams();
	const feed = searchParams.get("feed") || "home";

	const inViewportRef = React.useRef<HTMLDivElement | null>(null);
	const [currentSortOption, setCurrentSortOption] = React.useState("newest");

	const fetchData = React.useCallback(
		async (page: number) => {
			const { data } = await axiosInstance.get(`/api/v0/post/?page=${page}&type=${feed}`);
			return data;
		},
		[feed],
	);

	const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
		staleTime: 1000 * 30, // 30 seconds
		queryKey: ["homePosts", feed],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchData(pageParam);
		},
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const sortingFn = React.useMemo(() => {
		const sortOption = sortOptions.find((option) => option.value === currentSortOption);
		return sortOption?.sortingFn;
	}, [currentSortOption]);

	const virtualizer = useWindowVirtualizer({
		count: data?.pages.reduce((acc, group) => acc.concat(group.data), []).sort(sortingFn).length || 0,
		estimateSize: () => 190,
		paddingEnd: 20,
		overscan: 5,
	});
	const virtualItems = virtualizer.getVirtualItems();

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
		<main className="mx-auto flex w-full flex-col items-center justify-start overflow-hidden max-md:w-screen">
			<div className="flex w-full max-w-[85rem] flex-col px-10 pt-5 max-sm:px-4">
				<section className="flex w-full flex-col gap-2 border-b border-sidebar-border pb-5">
					<Select defaultValue={currentSortOption} onValueChange={setCurrentSortOption}>
						<SelectTrigger className="min-h-5 w-fit min-w-6 gap-1 rounded-full border-0 pl-4 text-black shadow-none focus-visible:border-0 focus-visible:ring-0 data-[placeholder]:text-black dark:dark:bg-transparent dark:text-white dark:dark:hover:bg-sidebar-accent/60 dark:focus-visible:border-0 dark:focus-visible:ring-0 dark:data-[placeholder]:text-white">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent className="w-20 rounded-sm border-0 p-0 shadow-none dark:bg-modal">
							<h1 className="px-2 pt-2 pb-3 text-sm font-semibold text-black dark:text-white">Sort by</h1>
							{sortOptions.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className="cursor-pointer py-2 text-left hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent"
								>
									{option.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</section>

				<section id="content" className="flex h-full w-full flex-col gap-2">
					{status === "pending" ? (
						<div className="my-20 flex w-full items-center justify-center">
							<Loading className="size-24" />
						</div>
					) : (
						<div className="flex h-full w-full flex-col">
							{!data?.pages.some((group) => group.data.length > 0) ? (
								<p className="my-20 text-center text-xl font-semibold text-black dark:text-white">No results found for this feed.</p>
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
												const post = data.pages.reduce((acc, group) => acc.concat(group.data), []).sort(sortingFn)[
													virtualRow.index
												];
												return (
													<div key={post.id} data-index={virtualRow.index} ref={virtualizer.measureElement}>
														<PostsCard className="my-1" data={post} />
														<hr className="w-full border-t-0 border-b border-sidebar-border" />
													</div>
												);
											})}
										</div>
									</div>

									<div ref={inViewportRef} className="w-full py-4">
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
