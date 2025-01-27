import type { Route } from "../+types/_layout"; // Import the Route type from the _layout file just cause its basically the index of the routes folder

export default function Index({ matches }: Route.ComponentProps) {
	const loader = matches[1];
	const loaderData = loader.data;

	return (
		<div className="flex h-full w-full flex-col items-start justify-center gap-2">
			<h1>Profile settings</h1>
		</div>
	);
}
