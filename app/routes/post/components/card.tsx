import editor_stylesheet from "~/styles/card.posts.mdx.css?url";
import type { Route } from "../+types/index"; // Import the Route type from the parent directory

import { MDXEditor } from "@mdxeditor/editor";
import { ClientOnly } from "remix-utils/client-only";

import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: editor_stylesheet }];

interface PostProps {
	username: string;
	title: string;
	content: string;
	likes: number;
	comments: number;
	createdAt: Date | number;
}

export default function Card(props: PostProps) {
	const dateInDaysAgo = Math.floor((Date.now() - new Date(props.createdAt).getTime()) / (1000 * 60 * 60 * 24));
	const dateInHoursAgo = Math.floor((Date.now() - new Date(props.createdAt).getTime()) / (1000 * 60 * 60));
	const dateInMinutesAgo = Math.floor((Date.now() - new Date(props.createdAt).getTime()) / (1000 * 60));
	const dateInSecondsAgo = Math.floor((Date.now() - new Date(props.createdAt).getTime()) / 1000);

	let timeAgo = "";
	if (dateInDaysAgo > 0) {
		timeAgo = `${dateInDaysAgo} days ago`;
	} else if (dateInHoursAgo > 0) {
		timeAgo = `${dateInHoursAgo} hours ago`;
	} else if (dateInMinutesAgo > 0) {
		timeAgo = `${dateInMinutesAgo} minutes ago`;
	} else {
		timeAgo = `${dateInSecondsAgo} seconds ago`;
	}

	return (
		<article className="w-full h-auto max-h-96 min-h-28 flex flex-col justify-between gap-3 px-4 py-2 dark:hover:bg-sidebar-accent/50 hover:bg-sidebar-foreground/10 rounded-xl">
			<span className="flex justify-start items-center gap-1">
				<span className="flex justify-center items-center gap-2">
					<Avatar className="size-6 rounded-full">
						<AvatarImage src={"https://cdn.discordapp.com/avatars/1325267844698734698/fdff993870a62c29081851408ec63b76.webp?size=32"} alt={"df"} className="rounded-full" />
						<AvatarFallback className="rounded-full">DF</AvatarFallback>
					</Avatar>
					<h1 className="text-sm text-black dark:text-white">{props.username}</h1>
				</span>
				<span className="inline-block my-0 text-[#333a3e] dark:text-[#333a3e]">•</span>
				<h2 className="text-xs text-black dark:text-white">{timeAgo}</h2>
			</span>

			<span className="h-full flex flex-col gap-1 justify-start items-start text-ellipsis overflow-hidden">
				<h1 className="text-lg font-bold text-black dark:text-white">{props.title}</h1>
				<ClientOnly>{() => <MDXEditor markdown={props.content} contentEditableClassName="text-ellipsis line-clamp-10 text-black dark:text-white" readOnly={true} />}</ClientOnly>
			</span>

			<span className="flex gap-2 justify-start items-start">
				<span className="w-fit flex gap-1 justify-between items-center rounded-3xl dark:bg-sidebar-accent bg-[#E5EBEE]">
					<span className="flex items-center justify-center">
						<Button
							disabled={true}
							className="group p-2 px-3 shadow-none flex items-center justify-center gap-1 rounded-full bg-transparent dark:bg-transparent dark:hover:bg-[#333a3e] hover:bg-[#75858f]/20 [&_svg]:size-4 dark:text-white text-black"
						>
							<ThumbsUp className="group-hover:text-red-400/85" />
						</Button>
					</span>

					<h1 className="text-sm text-black dark:text-white">{props.likes}</h1>

					<span className="flex items-center justify-center">
						<Button
							disabled={true}
							className="group p-2 px-3 shadow-none flex items-center justify-center gap-1 rounded-full bg-transparent dark:bg-transparent dark:hover:bg-[#333a3e] hover:bg-[#75858f]/20 [&_svg]:size-4 dark:text-white text-black"
						>
							<ThumbsDown className="group-hover:text-primary-400" />
						</Button>
					</span>
				</span>

				<Button
					disabled={true}
					className="w-fit flex gap-1 justify-start items-center rounded-3xl px-3 dark:bg-sidebar-accent bg-[#E5EBEE] dark:hover:bg-[#333a3e] hover:bg-[#75858f]/20 dark:text-white text-black"
				>
					<MessageCircle />
					<span className="text-sm text-black dark:text-white">{props.comments}</span>
				</Button>
			</span>
		</article>
	);
}
