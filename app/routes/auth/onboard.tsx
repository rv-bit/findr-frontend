import type { Route } from "./+types/onboard";

import { authClient } from "~/lib/auth";

export async function clientLoader() {
	const session = await authClient.getSession();
	if (session) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}
	return null;
}

export default function Register() {
	return (
		<div>
			<h1 className="text-black">Register</h1>
		</div>
	);
}
