import type { Route } from "./+types/_layout";

import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { authClient, type Session } from "~/lib/auth";
import { prefetchSession } from "~/lib/auth-prefetches";
import { queryClient } from "~/lib/query/query-client";
import { cn } from "~/lib/utils";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { type IconType } from "react-icons";
import { Button } from "~/components/ui/button";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const cachedData = queryClient.getQueryData<Session>(["session"]);
	const data = cachedData ?? (await prefetchSession(queryClient));

	if (!data.session || !data.user) {
		throw new Response("", { status: 302, headers: { Location: "/auth" } }); // Redirect to login
	}

	const session = {
		session: data.session,
		user: data.user,
	};

	if (!session) {
		throw new Response("", { status: 302, headers: { Location: "/auth" } }); // Redirect to login
	}

	const { data: accountLists, error: errorAccountLists } = await authClient.listAccounts();

	const hasPassword = accountLists?.some((account) => account.provider === "credential");
	const hasEmailVerified = session.user?.emailVerified;

	return {
		...session,
		accountLists: accountLists,
		hasEmailVerified: hasEmailVerified,
		hasPassword: hasPassword,
		hasTwoFactor: session.user?.twoFactorEnabled,
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
	return <div>Loading...</div>;
}

export default function Layout({ loaderData }: Route.ComponentProps) {
	const navRef = React.useRef<HTMLDivElement>(null);

	const navGoRightRef = React.useRef<HTMLButtonElement>(null);
	const navGoLeftRef = React.useRef<HTMLButtonElement>(null);

	const location = useLocation();
	const navigate = useNavigate();

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

	const isActive = (url: string | string[]) => {
		if (Array.isArray(url)) {
			return url.some((u) => location.pathname === u); // Check for exact path match in array
		}
		return location.pathname === url; // Check for exact path match
	};

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
				<div className="flex w-full max-w-7xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
					<h1 className="font-bricolage-grotesque text-4xl font-semibold tracking-tighter text-black capitalize dark:text-white">Settings</h1>
					<section className="relative w-full">
						<nav ref={navRef} className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={"link"}
									disabled={action.disabled}
									onClick={(e) => {
										e.preventDefault();
										navigate(typeof action.url === "string" ? action.url : action.url[1]);
									}}
									className={cn(
										"group relative h-auto min-w-fit shrink-0 items-center justify-center rounded-none px-4 py-2 hover:no-underline",
										isActive(action.url) ? "border-b-2 border-black dark:border-white" : "hover:border-b-2 hover:border-black/50 dark:hover:border-white/80",
									)}
								>
									{action.icon && <action.icon />}
									<h1
										className={cn(
											"inline-flex text-black",
											isActive(action.url) ? "text-black dark:text-white" : "group-hover:text-black/50 dark:text-[#8BA2AE] dark:group-hover:text-white/80",
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
