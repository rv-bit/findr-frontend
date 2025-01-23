import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from "react-router";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";

import { ThemeProvider } from "~/providers/Theme";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Topbar, TopbarInset, TopbarProvider } from "~/components/ui/topbar";
import { Toaster } from "~/components/ui/toaster";

import SidebarActions from "~/components/sidebar-main";
import TopbarActions from "./components/topbar-actions";
import { useEffect, useRef } from "react";

const queryClient = new QueryClient();

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
				<Meta />
				<Links />
			</head>
			<body>
				<LoadingBar ref={loadingBarRef} color="#FFFFFF" shadow={false} transitionTime={100} waitingTime={300} />

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
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
