import stylesheet from "./app.css?url";

import type { Route } from "./+types/root";

import { parse } from "cookie";
import React from "react";
import {
	data,
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigation,
	type LoaderFunctionArgs,
} from "react-router";

import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";

import { useNonce } from "~/hooks/useNonce";
import useRootLoader from "./hooks/useRootLoader";

import Providers from "./providers";

import * as APP_CONFIG from "~/config/app";
import { SIDEBAR_COOKIE_NAME, THEME_COOKIE_NAME } from "~/config/cookies";

import ErrorIcon from "~/icons/error";

export function meta({}: Route.MetaArgs) {
	return [{ title: APP_CONFIG.APP_NAME }, { name: "description", content: APP_CONFIG.APP_DESCRIPTION }];
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

export async function loader({ request }: LoaderFunctionArgs) {
	const cookie = parse(request.headers.get("cookie") ?? "");
	const cachedTheme = cookie[THEME_COOKIE_NAME] ?? null;
	const cachedSidebar = cookie[SIDEBAR_COOKIE_NAME] ? cookie[SIDEBAR_COOKIE_NAME] === "true" : true;

	return data({
		theme: cachedTheme as "light" | "dark" | null,
		sidebar: cachedSidebar as boolean,
	});
}

export function Layout({ children }: { children: React.ReactNode }) {
	const { theme: cookieTheme } = useRootLoader();
	const theme = cookieTheme ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

	const nonce = useNonce();
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

				<meta name="og:title" content={APP_CONFIG.APP_NAME} />
				<meta name="og:description" content={APP_CONFIG.APP_DESCRIPTION} />
				<meta name="og:type" content="website" />
				<meta name="og:url" content={APP_CONFIG.APP_URL} />

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
				<main
					style={{
						minHeight: "100svh",
						height: "100%",
						width: "100%",
					}}
				>
					{children}
				</main>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<Providers>
			<Outlet />
		</Providers>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		// 404 error page
		return (
			<main className="container mx-auto flex min-h-svh w-full flex-col items-center justify-center gap-2">
				<ErrorIcon width={300} height={300} />

				<h1 className="text-center text-3xl text-balance text-black max-sm:text-lg dark:text-white">
					{error.status === 404 ? "Oops! We couldn't find that page" : error.statusText || "Error"}
				</h1>
				<p className="text-md text-center text-balance text-black max-sm:text-sm dark:text-white">
					You can go back to the{" "}
					<Link viewTransition to={"/"} className="font-bold text-primary-300 italic hover:underline dark:text-primary-300">
						home page
					</Link>{" "}
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
		<main className="container mx-auto flex h-full w-full flex-wrap items-center justify-center">
			<p className="text-center text-balance text-black max-sm:text-lg dark:text-white">{details}</p>

			{stack && (
				<>
					<h1>{message}</h1>
					<pre className="w-full overflow-x-auto p-4 text-center text-balance text-black max-sm:text-lg dark:text-white">
						<code>{stack}</code>
					</pre>
				</>
			)}
		</main>
	);
}
