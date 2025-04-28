import editor_stylesheet from "~/styles/card.posts.mdx.css?url";
import type { Route } from "./+types/index";

import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router";

import axiosInstance from "~/lib/axios-instance";

import type { Post, User } from "~/lib/types/shared";

import Loading from "~/icons/loading";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import PostsCard from "./components/posts.card";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export function meta({}: Route.MetaArgs) {
	return [{ title: "Findr" }, { name: "description", content: "Findr" }];
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

	const inViewportRef = React.useRef(null);

	const [currentSortOption, setCurrentSortOption] = React.useState("newest");

	const fetchData = React.useCallback(
		async (page: number) => {
			const { data } = await axiosInstance.get(`/api/v0/post/?page=${page}&type=${searchParams.get("feed")}`);
			return data;
		},
		[searchParams],
	);

	const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
		staleTime: 0,
		queryKey: ["homePosts", searchParams.get("feed")],
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
		<main className="mx-auto flex h-full w-full flex-col items-center justify-start pb-5 max-md:w-screen">
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

				<section id="content" className="flex w-full flex-col gap-2">
					{status === "pending" ? (
						<div className="my-20 flex w-full items-center justify-center">
							<Loading className="size-24" />
						</div>
					) : (
						<div className="flex w-full flex-col">
							{!data?.pages.some((group) => group.data.length > 0) ? (
								<p className="my-20 text-center text-xl font-semibold text-black dark:text-white">No results found for this feed.</p>
							) : (
								data?.pages.map((group, i) => (
									<React.Fragment key={i}>
										{group.data.sort(sortingFn).map(
											(
												post: Post & {
													user: User;
												},
											) => (
												<React.Fragment key={post.id}>
													<PostsCard className="my-1" data={post} />
													<hr className="w-full border-t-0 border-b border-sidebar-border" />
												</React.Fragment>
											),
										)}
									</React.Fragment>
								))
							)}

							{hasNextPage && (
								<div ref={inViewportRef}>
									{isFetchingNextPage && (
										<div className="my-20 flex w-full items-center justify-center">
											<Loading className="size-24" />
										</div>
									)}
								</div>
							)}
							{error && <div>Error: {error.message}</div>}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
