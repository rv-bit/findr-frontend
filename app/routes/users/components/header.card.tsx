import React from "react";
import { Link, NavLink, useLocation, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import type { Session } from "~/lib/auth-client";
import type { User } from "~/lib/types/shared";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { buttonVariants } from "~/components/ui/button";
import { sortOptions, types } from "~/routes/users/shared/constants";

const HeaderCard = React.memo(
	({
		session,
		user,
		className,
	}: React.ComponentProps<"article"> & {
		session: Session | null;
		user: User;
	}) => {
		const location = useLocation();

		const [searchParams, setSearchParams] = useSearchParams();
		const currentSortOption = searchParams.get("sort") || sortOptions[0].value;

		const navRef = React.useRef<HTMLDivElement | null>(null);
		const navGoRightRef = React.useRef<HTMLDivElement | null>(null);
		const navGoLeftRef = React.useRef<HTMLDivElement | null>(null);

		const handleScrollAndResize = React.useCallback(() => {
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
		}, [navRef, navGoRightRef, navGoLeftRef]);

		const isActive = React.useMemo(
			() => (url: string, queryKey: string, query: string) => {
				const pathname = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
				const params = searchParams.get(queryKey);

				const isQueryMatch = params === query;
				return pathname === url && isQueryMatch;
			},
			[location, searchParams],
		);

		const isUserSession = React.useMemo(() => {
			if (!session || !user) return false;
			return session.user.username === user.username;
		}, [session, user]);

		React.useLayoutEffect(() => {
			if (!navRef.current) return;
			handleScrollAndResize();

			navRef.current.addEventListener("scroll", handleScrollAndResize);
			window.addEventListener("resize", handleScrollAndResize);

			return () => {
				navRef.current?.removeEventListener("scroll", handleScrollAndResize);
				window.removeEventListener("resize", handleScrollAndResize);
			};
		}, [navRef]);

		React.useLayoutEffect(() => {
			return () => {
				if (navRef.current) {
					navRef.current.scrollLeft = 0;
				}
			};
		}, [navRef]);

		return (
			<section id="top-information" className={cn("flex flex-col items-start gap-4 border-b border-sidebar-border pb-2", className)}>
				<section className="flex items-center justify-between gap-4">
					<span className="size-fit rounded-full bg-sidebar-foreground/20 p-1 dark:bg-sidebar-accent">
						<Avatar className="size-18 rounded-full">
							<AvatarImage loading="lazy" src={user.image ?? ""} alt={user.username} />
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
				</section>

				<section className="flex w-full flex-col gap-4">
					<div className="relative w-full">
						<nav
							ref={navRef}
							className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible"
						>
							{types.map((action, index) => (
								<NavLink
									key={index}
									to={{
										pathname: `${action.url}/${user.username}`,
										search: action?.queryKey ? `?${action?.queryKey}=${action.query}` : "",
									}}
									onClick={(e: React.MouseEvent) => {
										if (action.disabled) {
											e.preventDefault();
											return;
										}
									}}
									viewTransition
									className={({}) => {
										const active = isActive(action.url, action.queryKey, action.query);

										return cn(
											buttonVariants({
												variant: "link",
												size: "default",
											}),
											"group relative h-auto min-w-fit shrink-0 items-center justify-center rounded-full px-4 py-2 hover:no-underline",
											active
												? "bg-sidebar-foreground/50 dark:bg-sidebar-accent"
												: "hover:bg-sidebar-accent-foreground/20 dark:hover:bg-sidebar-accent/50",
										);
									}}
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
								</NavLink>
							))}
						</nav>

						<div
							ref={navGoLeftRef}
							className="absolute top-0 left-0 hidden bg-linear-to-l from-transparent from-0% to-sidebar to-30% pr-3"
						>
							<button
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

						<div
							ref={navGoRightRef}
							className="absolute top-0 right-0 hidden bg-linear-to-r from-transparent from-0% to-sidebar to-30% pl-3"
						>
							<button
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

					<span className="flex items-center justify-start gap-2">
						{isUserSession && (
							<Link
								viewTransition
								to={`/post/create/?type=text`}
								className="flex h-9 w-fit items-center justify-center gap-1 rounded-full border border-black/50 bg-transparent px-4 text-black shadow-none dark:border-white/50 dark:bg-transparent dark:text-white dark:hover:border-white"
							>
								<Plus size={22} />
								<span className="text-xs capitalize">Create Post</span>
							</Link>
						)}

						<Select
							defaultValue={currentSortOption}
							onValueChange={(value) => {
								setSearchParams((prev) => {
									prev.set("sort", value);
									return prev;
								});
							}}
						>
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
					</span>
				</section>
			</section>
		);
	},
);

export default HeaderCard;
