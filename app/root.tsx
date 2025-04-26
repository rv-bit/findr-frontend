import stylesheet from "./app.css?url";

import type { Route } from "./+types/root";

import { parse } from "cookie";
import React from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigation, type LoaderFunctionArgs } from "react-router";

import { QueryClientProvider } from "@tanstack/react-query";

import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";

import queryClient from "./lib/query/query-client";

import { THEME_COOKIE_NAME, ThemeProvider } from "~/providers/Theme";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { Topbar, TopbarInset, TopbarProvider } from "~/components/ui/topbar";

import SidebarActions from "~/components/sidebar-main";
import TopbarActions from "./components/topbar-actions";

import ErrorIcon from "~/icons/error";

export function meta({}: Route.MetaArgs) {
	return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap",
	},
	{ rel: "stylesheet", href: stylesheet },
];

export function loader({ request }: LoaderFunctionArgs) {
	const cookie = parse(request.headers.get("cookie") ?? "");
	const cachedTheme = cookie[THEME_COOKIE_NAME] ?? null;

	return {
		theme: cachedTheme,
	};
}

export function Layout({ children }: { children: React.ReactNode }) {
	const { theme: cookieTheme } = useLoaderData<typeof loader>();
	const theme = cookieTheme ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

	const navigation = useNavigation();
	const loadingBarRef = React.useRef<LoadingBarRef>(null);

	React.useEffect(() => {
		if (navigation.state === "loading" || navigation.state === "submitting") {
			loadingBarRef.current?.continuousStart();
		}

		if (navigation.state === "idle") {
			loadingBarRef.current?.complete();
		}
	}, [navigation.state]);

	return (
		<html lang="en" className={theme} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />

				<Meta />
				<Links />

				{/* To avoid FOUC aka Flash of Unstyled Content */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								const cookieMatch = document.cookie.match(new RegExp("(^| )${THEME_COOKIE_NAME}=([^;]+)"))
								const cachedTheme = cookieMatch ? (cookieMatch[2]) : 'light'

								document.documentElement.classList.toggle('dark', cachedTheme === 'dark' || (!(document.cookie.match(new RegExp("(^| )${THEME_COOKIE_NAME}=([^;]+)"))) && window.matchMedia('(prefers-color-scheme: dark)').matches))
							})();
						`,
					}}
				/>
			</head>
			<body>
				<LoadingBar ref={loadingBarRef} color="#5060dd" shadow={false} transitionTime={100} waitingTime={300} />

				<QueryClientProvider client={queryClient}>
					<ThemeProvider>
						<TopbarProvider>
							<SidebarProvider>
								<Topbar>
									<TopbarInset>
										<TopbarActions />
									</TopbarInset>
								</Topbar>
								<SidebarActions />
								<SidebarInset>
									<main
										style={{
											height: "100%",
											width: "100%",
											flex: "1 1 0%",
											overflowY: "auto",
										}}
									>
										{children}
									</main>
									<Toaster />
								</SidebarInset>
							</SidebarProvider>
						</TopbarProvider>
					</ThemeProvider>
				</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		// 404 error page
		return (
			<main className="container mx-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<ErrorIcon width={300} height={300} />

				<h1 className="text-center text-3xl text-balance text-black max-sm:text-lg dark:text-white">
					{error.status === 404 ? "Oops! We couldn't find that page" : error.statusText || "Error"}
				</h1>
				<p className="text-md text-center text-balance max-sm:text-sm">
					You can go back to the{" "}
					<a className="font-bold italic hover:underline" href="/">
						home page
					</a>{" "}
					or try again later.
				</p>
			</main>
		);
	}

	if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto flex h-full w-full items-center justify-center">
			<p>{details}</p>

			{stack && (
				<>
					<h1>{message}</h1>
					<pre className="w-full overflow-x-auto p-4">
						<code>{stack}</code>
					</pre>
				</>
			)}
		</main>
	);
}
