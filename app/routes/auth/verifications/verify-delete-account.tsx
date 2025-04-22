import type { Route } from "../verifications/+types/verify-email";

import React from "react";
import { useNavigate, useSearchParams } from "react-router";

import { useSession } from "~/hooks/use-auth";

import { authClient, type Session } from "~/lib/auth";
import { prefetchSession } from "~/lib/auth-prefetches";

import queryClient from "~/lib/query/query-client";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const cachedData = queryClient.getQueryData<Session>(["session"]);
	const data = cachedData ?? (await prefetchSession(queryClient));

	const session = {
		session: data.session,
		user: data.user,
	};

	if (!session.session || !session.user) {
		throw new Response("", { status: 302, headers: { Location: "/auth" } }); // Redirect to login
	}

	return null;
}

export default function Index() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const { refetch } = useSession();

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
						onSuccess: async () => {
							await authClient.signOut(); // try Sign out user
							await refetch(); // try refetch session

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
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Account has been deleted, you can now close this page</h1>
				) : (
					<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Failed to delete account</h1>
				)}
			</div>
		</div>
	);
}
