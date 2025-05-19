import type { Route } from "./+types/_layout";

import React from "react";
import { NavLink, Outlet, useLocation } from "react-router";

import { authClient } from "~/lib/auth-client";

import { cn } from "~/lib/utils";

import { buttonVariants } from "~/components/ui/button";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { type IconType } from "react-icons";
import Loading from "~/icons/loading";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const { data: sessionData } = await authClient.getSession();
	if (!sessionData || !sessionData.user || !sessionData.session) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const { data: accountLists, error: errorAccountLists } = await authClient.listAccounts();
	const { data: listSessions, error: errorListSessions } = await authClient.listSessions();
	const hasPassword = accountLists?.some((account) => account.provider === "credential");
	const hasEmailVerified = sessionData.user?.emailVerified;
	const hasTwoFactor = sessionData.user?.twoFactorEnabled;

	return {
		session: sessionData.session,
		user: sessionData.user,

		listSessions,
		accountLists,
		hasEmailVerified,
		hasPassword,
		hasTwoFactor,
	};
}

interface Actions {
	title: string;
	url: string | string[];
	icon?: LucideIcon | IconType;
	disabled?: boolean;
}

const actions: Actions[] = [
	{
		title: "Account",
		url: ["/settings", "/settings/account"],
	},
	{
		title: "Security",
		url: "/settings/security",
	},
	{
		title: "Profile",
		url: "/settings/profile",
	},
	{
		title: "Privacy",
		url: "/settings/privacy",
		disabled: true,
	},
	{
		title: "Notifications",
		url: "/settings/notifications",
		disabled: true,
	},
];

export function HydrateFallback() {
	return (
		<div className="flex w-full items-center justify-center">
			<Loading className="size-24" />
		</div>
	);
}

export default function Layout({ loaderData }: Route.ComponentProps) {
	const navRef = React.useRef<HTMLDivElement>(null);

	const navGoRightRef = React.useRef<HTMLButtonElement>(null);
	const navGoLeftRef = React.useRef<HTMLButtonElement>(null);

	const location = useLocation();

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

	const isActive = (url: string | string[]) => {
		if (Array.isArray(url)) {
			return url.some((u) => location.pathname === u); // Check for exact path match in array
		}
		return location.pathname === url; // Check for exact path match
	};

	React.useLayoutEffect(() => {
		if (!navRef.current) return;
		handleScrollAndResize();

		navRef.current.addEventListener("scroll", handleScrollAndResize);
		window.addEventListener("resize", handleScrollAndResize);

		return () => {
			navRef.current?.removeEventListener("scroll", handleScrollAndResize);
			window.removeEventListener("resize", handleScrollAndResize);
		};
	}, []);

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
				<div className="flex w-full max-w-7xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
					<h1 className="font-bricolage text-4xl font-semibold tracking-tighter text-black capitalize dark:text-white">Settings</h1>
					<section className="relative w-full">
						<nav
							ref={navRef}
							className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible"
						>
							{actions.map((action, index) => (
								<NavLink
									key={index}
									to={{
										pathname: typeof action.url === "string" ? action.url : action.url[1],
									}}
									onClick={(e: React.MouseEvent) => {
										if (action.disabled) {
											e.preventDefault();
											return;
										}
									}}
									viewTransition
									className={({}) => {
										const active = isActive(action.url);

										return cn(
											buttonVariants({
												variant: "link",
												size: "default",
											}),
											"group relative h-auto min-w-fit shrink-0 items-center justify-center rounded-none px-4 py-2 hover:no-underline",
											{
												"border-b-2 border-black dark:border-white": active,
												"hover:border-b-2 hover:border-black/50 dark:hover:border-white/80": !active,
												"cursor-not-allowed opacity-50": action.disabled,
											},
										);
									}}
								>
									{action.icon && <action.icon />}
									<h1
										className={cn("inline-flex text-black", {
											"text-black dark:text-white": isActive(action.url),
											"group-hover:text-black/50 dark:text-[#8BA2AE] dark:group-hover:text-white/80": !isActive(action.url),
										})}
									>
										{action.title}
									</h1>
								</NavLink>
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
								className="flex size-10 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
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
								className="flex size-10 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
							>
								<ChevronRight className="h-6 w-6 text-black dark:text-white" />
							</button>
						</div>
					</section>

					<Outlet />
				</div>
			</div>
		</React.Fragment>
	);
}
