import { codeBlockPlugin, headingsPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import { ClientOnly } from "remix-utils/client-only";

import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

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
		<article className="flex h-auto max-h-96 min-h-28 w-full flex-col justify-between gap-3 rounded-xl px-4 py-2 hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50">
			<span className="flex items-center justify-start gap-1">
				<span className="flex items-center justify-center gap-2">
					<Avatar className="size-6 rounded-full">
						<AvatarImage src={"https://cdn.discordapp.com/avatars/1325267844698734698/fdff993870a62c29081851408ec63b76.webp?size=32"} alt={"df"} className="rounded-full" />
						<AvatarFallback className="rounded-full">DF</AvatarFallback>
					</Avatar>
					<h1 className="text-sm text-black dark:text-white">{props.username}</h1>
				</span>
				<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
				<h2 className="text-xs text-black dark:text-white">{timeAgo}</h2>
			</span>

			<span className="flex h-full flex-col items-start justify-start gap-1 overflow-hidden text-ellipsis">
				<h1 className="w-full text-lg font-bold break-all text-black dark:text-white">{props.title}</h1>
				<ClientOnly>
					{() => (
						<MDXEditor
							markdown={props.content}
							plugins={[
								quotePlugin(),
								listsPlugin(),
								codeBlockPlugin(),
								headingsPlugin({
									allowedHeadingLevels: [1, 2, 3],
								}),
								quotePlugin(),
								thematicBreakPlugin(),
								markdownShortcutPlugin(),
							]}
							className="w-full overflow-hidden text-ellipsis"
							contentEditableClassName="text-ellipsis line-clamp-10 text-gray-500 dark:text-gray-400 w-full"
							readOnly={true}
						/>
					)}
				</ClientOnly>
			</span>

			<span className="flex items-start justify-start gap-2">
				<span className="flex w-fit items-center justify-between gap-1 rounded-3xl bg-[#E5EBEE] dark:bg-sidebar-accent">
					<span className="flex items-center justify-center">
						<Button
							disabled={true}
							className="group flex items-center justify-center gap-1 rounded-full bg-transparent p-2 px-3 text-black shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4"
						>
							<ThumbsUp className="group-hover:text-red-400/85" />
						</Button>
					</span>

					<h1 className="text-sm text-black dark:text-white">{props.likes}</h1>

					<span className="flex items-center justify-center">
						<Button
							disabled={true}
							className="group flex items-center justify-center gap-1 rounded-full bg-transparent p-2 px-3 text-black shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-4"
						>
							<ThumbsDown className="group-hover:text-primary-400" />
						</Button>
					</span>
				</span>

				<Button
					disabled={true}
					className="flex w-fit items-center justify-start gap-1 rounded-3xl bg-[#E5EBEE] px-3 text-black hover:bg-[#75858f]/20 dark:bg-sidebar-accent dark:text-white dark:hover:bg-[#333a3e]"
				>
					<MessageCircle />
					<span className="text-sm text-black dark:text-white">{props.comments}</span>
				</Button>
			</span>
		</article>
	);
}
