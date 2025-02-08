import { useEffect, useRef } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from "react-router";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { QueryClientProvider } from "@tanstack/react-query";

import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";

import { queryClient } from "./lib/query/query-client";

import { ThemeProvider } from "~/providers/Theme";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/toaster";
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

export function Layout({ children }: { children: React.ReactNode }) {
	const navigation = useNavigation();
	const loadingBarRef = useRef<LoadingBarRef>(null);

	useEffect(() => {
		if (navigation.state === "loading" || navigation.state === "submitting") {
			loadingBarRef.current?.continuousStart();
		}

		if (navigation.state === "idle") {
			loadingBarRef.current?.complete();
		}
	}, [navigation.state]);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
				<Meta />
				<Links />
			</head>
			<body>
				<LoadingBar ref={loadingBarRef} color="#5060dd" shadow={false} transitionTime={100} waitingTime={300} />

				<QueryClientProvider client={queryClient}>
					<AuthQueryProvider>
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
					</AuthQueryProvider>
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
			<main className="h-full w-full container mx-auto flex flex-col justify-center items-center gap-2">
				<ErrorIcon width={300} height={300} />

				<h1 className="max-sm:text-lg text-balance text-center text-3xl text-black dark:text-white">
					{error.status === 404 ? "Oops! We couldn't find that page" : error.statusText || "Error"}
				</h1>
				<p className="max-sm:text-sm text-md text-balance text-center">
					You can go back to the{" "}
					<a className="hover:underline font-bold italic" href="/">
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
		<main className="h-full w-full container mx-auto flex justify-center items-center">
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
