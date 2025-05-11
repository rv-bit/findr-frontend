import default_editor_stylesheet from "@mdxeditor/editor/style.css?url";
import editor_stylesheet from "~/styles/form.default.mdx.css?url";
import type { Route } from "./+types/new";

import React, { Suspense } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

const ActionForm = React.lazy(() => import("./components/form.new"));

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: default_editor_stylesheet }, // default styles
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

const types: {
	title: string;
	url: string;
	queryKey: string;
	query: string;
	icon?: LucideIcon;
	disabled?: boolean;
}[] = [
	{
		title: "Text",
		url: "/post/new/",
		queryKey: "type",
		query: "text",
	},
	{
		title: "Images",
		url: "/post/new/",
		queryKey: "type",
		query: "images",
		disabled: true,
	},
	{
		title: "Link",
		url: "/post/new/",
		queryKey: "type",
		query: "link",
		disabled: true,
	},
];

export default function Index() {
	const navRef = React.useRef<HTMLDivElement>(null);

	const navGoRightRef = React.useRef<HTMLButtonElement>(null);
	const navGoLeftRef = React.useRef<HTMLButtonElement>(null);

	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

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
			const isQueryMatch = searchParams.get(queryKey) === query;
			return location.pathname === url && isQueryMatch;
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

	return (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="flex w-full max-w-5xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
				<h1 className="mb-2 text-3xl font-semibold text-black capitalize dark:text-white">Create Post</h1>

				<section className="relative w-full">
					<nav
						ref={navRef}
						className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible"
					>
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
									"group relative h-auto min-w-fit shrink-0 items-center justify-center rounded-none px-4 py-2 hover:no-underline",
									isActive(action.url, action?.queryKey, action?.query)
										? "border-b-2 border-black dark:border-white"
										: "hover:border-b-2 hover:border-black/50 dark:hover:border-white/80",
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

				<Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading...</div>}>
					<ActionForm />
				</Suspense>
			</div>
		</div>
	);
}
