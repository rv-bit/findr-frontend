import type { Route } from "./+types/index";

export default function Index({ loaderData }: Route.ComponentProps) {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">OWOWOW</div>
		</div>
	);
}
