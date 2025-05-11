import type { Route } from "./+types/page.verify-email";

import React from "react";
import { useNavigate, useSearchParams } from "react-router";

import { authClient } from "~/lib/auth.client";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const { data: sessionData } = await authClient.getSession();
	if (!sessionData || !sessionData.user || !sessionData.session) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	return null;
}

export default function Index() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const [loading, setLoading] = React.useState(false);
	const [verified, setVerified] = React.useState(false);

	React.useEffect(() => {
		const token = searchParams.get("token"); // Check if token is present
		if (token) {
			setLoading(true);

			(async () => {
				await authClient.verifyEmail(
					{
						query: {
							token: token,
							// callbackURL: `${window.location.origin}/auth`,
						},
					},
					{
						onSuccess: async () => {
							await authClient.signOut(); // try Sign out user

							setVerified(true);
							setLoading(false);
						},
						onError: () => {
							setLoading(false);
						},
					},
				);
			})();
		} else {
			navigate("/auth");
		}
	}, [searchParams]);

	if (loading) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
				<div className="flex w-full max-w-lg flex-col gap-6">
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Loading...</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex w-full max-w-lg flex-col gap-6">
				{verified ? (
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">
						Email has been verified, you can now close this page
					</h1>
				) : (
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Failed to verify email</h1>
				)}
			</div>
		</div>
	);
}
