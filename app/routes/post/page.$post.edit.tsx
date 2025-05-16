import core_editor_fonts from "@blocknote/core/fonts/inter.css?url";
import core_editor_stylesheet from "@blocknote/shadcn/style.css?url";
import edited_editor_stylesheet from "~/styles/form.default.mdx.css?url";

import type { Route } from "./+types/page.$post.edit";

import { useLoaderData } from "react-router";
import { ClientOnly } from "remix-utils/client-only";

import axiosInstance from "~/lib/axios.instance";
import type { Post, User } from "~/lib/types/shared";

import ActionForm from "./components/form.edit";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: core_editor_fonts },
	{ rel: "stylesheet", href: core_editor_stylesheet },

	{ rel: "stylesheet", href: edited_editor_stylesheet }, // override styles
];

export async function loader({ params }: Route.LoaderArgs) {
	const { postId } = params;

	if (!postId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const response = await axiosInstance.get(`/api/v0/post/${postId}`);
	if (response.status !== 200) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const data = response.data.data as Post & { user: User };
	if (!data) {
		// Check if the post exists
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	return { data };
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="flex w-full max-w-5xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
				<h1 className="mb-2 text-3xl font-semibold text-black capitalize dark:text-white">Editing Post</h1>

				<ClientOnly>{() => <ActionForm data={loaderData.data} />}</ClientOnly>
			</div>
		</div>
	);
}
