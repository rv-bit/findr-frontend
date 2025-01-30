import type { Route } from "../verifications/+types/verify-email";

import React from "react";
import { useNavigate, useSearchParams } from "react-router";

import { authClient } from "~/lib/auth";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const { data: session, error } = await authClient.getSession();
	if (!session) {
		throw new Response("", { status: 302, headers: { Location: "/auth" } }); // Redirect to login
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
				await authClient.deleteUser(
					{
						token: token,
						callbackURL: "/auth",
					},
					{
						onSuccess: () => {
							console.log("Email has been verified");

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

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex w-full max-w-lg flex-col gap-6">
				{loading && <h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Loading...</h1>}
				{!loading && verified ? (
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Account has been deleted, you can now close this page</h1>
				) : (
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Failed to delete account</h1>
				)}
			</div>
		</div>
	);
}
