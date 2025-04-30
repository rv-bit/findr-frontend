import { cn, formatTime } from "~/lib/utils";

import type { Comments, User } from "~/lib/types/shared";

import { MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

export default function CommentsCard({
	className,
	data,
	user,
}: React.ComponentProps<"article"> & {
	data: Comments;
	user: User;
}) {
	const timeAgo = formatTime(data.createdAt);

	return (
		<article
			className={cn(
				"flex h-auto max-h-96 min-h-28 w-full flex-col justify-between gap-3 px-4 py-2 hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50",
				className,
			)}
		>
			<span className="flex items-center justify-start gap-1">
				<span className="flex items-center justify-center gap-2">
					<Avatar className="size-6 rounded-full">
						<AvatarImage
							loading="lazy"
							src={`${user.image?.startsWith("http") ? user.image : `${import.meta.env.VITE_CLOUD_FRONT_URL}/${user.image}`}`}
							alt={user.username}
						/>
						<AvatarFallback className="rounded-lg bg-sidebar-foreground/50">
							{user.username
								?.split(" ")
								.map((name) => name[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
					<h1 className="text-sm text-black dark:text-white">{user.username}</h1>
				</span>
				<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
				<h2 className="text-xs text-black dark:text-white">{timeAgo}</h2>
			</span>

			<span className="flex h-full flex-col items-start justify-start gap-1 overflow-hidden text-ellipsis">
				<h1 className="w-full text-lg font-bold break-all text-black dark:text-white">{data.postTitle}</h1>
				<p className="text-sm text-black/50 dark:text-white/50">{data.text}</p>
			</span>

			<span className="flex items-start justify-start gap-2">
				<Button
					disabled={true}
					className="flex w-fit items-center justify-start gap-1 rounded-3xl bg-[#E5EBEE] px-3 text-black hover:bg-[#75858f]/20 dark:bg-sidebar-accent dark:text-white dark:hover:bg-[#333a3e]"
				>
					<MessageCircle />
					<span className="text-sm text-black dark:text-white">Reply</span>
				</Button>
			</span>
		</article>
	);
}
