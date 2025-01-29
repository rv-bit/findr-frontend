import React, { useEffect } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

export default function Index() {
	const inViewportRef = React.useRef(null);
	const fetchProjects = async ({ pageParam: pageParam = 0 }) => {
		const res = await fetch("/api/v1/projects", {
			method: "POST",
			body: JSON.stringify({ pageParam }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		return res.json();
	};

	const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
		queryKey: ["projects"],
		queryFn: fetchProjects,
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
		<>
			<h1>Welcome</h1>
			{/* <div>
				{data?.pages.map((group, i) => (
					<React.Fragment key={i}>
						{group.data.map((project: any) => (
							<p key={project.id}>{project.name}</p>
						))}
					</React.Fragment>
				))}
				{hasNextPage && (
					<div ref={inViewportRef}>
						{isFetchingNextPage && (
							<p>Loading more...</p>
						)}
						{!isFetchingNextPage && (
							<button onClick={() => fetchNextPage()}>
								{hasNextPage ? 'Load More' : 'Nothing more to load'}
							</button>
						)}
					</div>
				)}
			</div> */}
		</>
	);
}
