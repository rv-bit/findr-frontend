import { useInfiniteQuery } from "@tanstack/react-query";
import type { Route } from "./+types/index";

import React, { useEffect } from "react";

import axiosInstance from "~/lib/axios-instance";

// export async function loader({ params }: Route.LoaderArgs) {
// 	const data = await queryClient.prefetchInfiniteQuery({
// 		queryKey: ["posts"],
// 		queryFn: async ({ pageParam = 0 }) => {
// 			const res = await fetch("/api/v1/posts", {
// 				method: "POST",
// 				body: JSON.stringify({ pageParam }),
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 			});
// 			return res.json();
// 		},
// 		initialPageParam: 0,
// 	});

// 	return { data };
// }

// export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
// 	const cachedData = queryClient.getQueryData(["posts"]);
// 	const data = cachedData ?? (await serverLoader());

// 	return data;
// }

interface PostProps {
	username: string;
	title: string;
	content: string;
	likes: number;
	comments: number;
	createdAt: Date | number;
}

export function HydrateFallback() {
	return <div>Loading...</div>;
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const inViewportRef = React.useRef(null);

	const fetchPosts = async ({ pageParam: pageParam = 0 }) => {
		const res = await axiosInstance.get("/api/v0/post/", {
			// body: JSON.stringify({ pageParam }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		return res.data;
	};

	const {
		data: posts,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery({
		queryKey: ["posts"],
		queryFn: fetchPosts,
		initialPageParam: 0,
		getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
	});

	useEffect(() => {
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

	return status === "pending" ? (
		<p>Loading...</p>
	) : status === "error" ? (
		<p>Error: {error.message}</p>
	) : (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="overflow-hidden flex w-full max-w-5xl flex-col gap-1 px-10 pt-8 max-sm:px-4">
				<div>
					{posts?.pages.map((group, i) => (
						<React.Fragment key={i}>
							{group.data.map((project: any) => (
								<p key={project.id}>{project.name}</p>
							))}
						</React.Fragment>
					))}
					{hasNextPage && (
						<div ref={inViewportRef}>
							{isFetchingNextPage && <p>Loading more...</p>}
							{!isFetchingNextPage && <button onClick={() => fetchNextPage()}>{hasNextPage ? "Load More" : "Nothing more to load"}</button>}
						</div>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="overflow-hidden flex w-full max-w-5xl flex-col gap-1 px-10 pt-8 max-sm:px-4">Welcome</div>
		</div>
	);
}
