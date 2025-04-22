import type { Route } from "./+types/profile";

import axiosInstance from "~/lib/axios-instance";

export async function loader({ params }: Route.LoaderArgs) {
	const { id } = params;
	const slug = id as string;

	if (!slug) {
		return new Response("User ID is required", { status: 400 });
	}

	const response = await axiosInstance.get(`/api/v0/users/${slug}`);

	if (!response.status) {
		return new Response("User not found", { status: 404 });
	}

	const user = response.data.data;
	return {
		user,
	};
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	const serverData = await serverLoader();

	return {
		...serverData,
	};
}

export function HydrateFallback() {
	return <div>Loading...</div>;
}

export default function Index({ loaderData }: Route.ComponentProps) {
	// const { user } = loaderData;

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">OWOWOW</div>
		</div>
	);
}
