import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router";

import axiosInstance from "~/lib/axios.instance";

import type { User } from "~/lib/types/shared";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";

import { Cake } from "lucide-react";

const fetchUserData = async (username: string): Promise<User> => {
	const response = await axiosInstance.get(`/api/v0/users/${username}`);

	if (response.status !== 200) {
		throw new Error("Failed to fetch user data");
	}

	return response.data.data;
};

export default function HoverCardUser({ username, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root> & { username: string }) {
	const [isHovering, setIsHovering] = React.useState(false);

	const { data, isLoading, error } = useQuery<User>({
		queryKey: ["hoverUserData", username],
		queryFn: () => fetchUserData(username),
		enabled: isHovering,
		staleTime: 1 * 60 * 1000,
	});

	const handleMouseEnter = () => {
		setIsHovering(true);
	};
	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	return (
		<HoverCard>
			<HoverCardTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
				{props.children}
			</HoverCardTrigger>
			<HoverCardContent align="start" className="flex flex-col gap-2 rounded-2xl border-none dark:bg-modal">
				{isLoading && (
					<div className="flex items-center justify-center py-2">
						<div className="size-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
					</div>
				)}
				{data && (
					<>
						<div className="flex w-full items-center justify-start gap-2">
							<Avatar className="size-12 rounded-full">
								<AvatarImage loading="lazy" src={data.image ?? ""} alt={username} />
								<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]">
									{username
										?.split(" ")
										.map((name) => name[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col justify-start gap-1">
								<span className="flex flex-col justify-start -space-y-2">
									<Link to={`/users/${username}`} className="group flex cursor-pointer items-center justify-start gap-1">
										<h1 className="text-lg break-all text-black group-hover:text-primary-300 group-hover:underline dark:text-white group-hover:dark:text-primary-300">
											{username}
										</h1>
									</Link>
									<span className="text-xs break-all text-black/50 dark:text-neutral-500">
										<span>u/</span>
										{username}
									</span>
								</span>

								<div className="flex gap-1 text-xs break-all text-black/50 dark:text-neutral-500">
									<Cake className="size-4" />
									{new Date(data.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</div>
							</div>
						</div>
						<span className="text-xs break-all text-black/50 dark:text-neutral-500">{data.about_description}</span>

						<span className="flex items-center justify-start gap-2">
							<span className="flex flex-col items-start justify-start">
								<h1 className="font-bricolage text-base font-semibold break-all text-black/50 dark:text-neutral-500">
									{data.postsCount}
								</h1>
								<p className="font-bricolage text-xs break-all text-black/50 dark:text-neutral-500">Posts</p>
							</span>
							<span className="flex flex-col items-start justify-start">
								<h1 className="font-bricolage text-base font-semibold break-all text-black/50 dark:text-neutral-500">
									{data.commentsCount}
								</h1>
								<p className="font-bricolage text-xs break-all text-black/50 dark:text-neutral-500">Comments</p>
							</span>
						</span>
					</>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}
