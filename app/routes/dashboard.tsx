import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard" }, { name: "description", content: "Dashboard" }];
}

export default function Dashboard() {
	return (
		<div>
			<h1 className="text-black">Dashboard</h1>
		</div>
	);
}
