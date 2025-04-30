import React from "react";
import { type UseFormReturn } from "react-hook-form";

import { cn } from "~/lib/utils";

import { CaseSensitive, ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

type CommentBoxProps = React.ComponentProps<"div"> & {
	open?: boolean;
	disabled?: boolean;
	readOnly?: boolean;

	form: UseFormReturn<
		{
			content: string;
		},
		any,
		{
			content: string;
		}
	>;
	onHandleOpenCommentButton: () => void;
	onHandleSubmit: (data: any) => void;
	onCancelComment: () => void;
};

const CommentBox = React.forwardRef<HTMLTextAreaElement, CommentBoxProps>(({ className, ...props }, commentTextAreaRef) => {
	const [commentButtonClicked, setCommentButtonClicked] = React.useState(props.open || false);

	const [isClient, setIsClient] = React.useState(false);

	React.useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div
			onClick={(e) => {
				props.onHandleOpenCommentButton();

				setCommentButtonClicked(true);
			}}
			className={cn(
				"group relative flex cursor-default flex-col items-center justify-between overflow-hidden rounded-full border border-neutral-500/50 bg-transparent px-0 py-0 pb-0 font-bricolage text-black focus-within:border-neutral-500 dark:border-white/50 dark:bg-transparent dark:text-white focus-within:dark:border-white",
				{
					"h-auto min-h-35 items-start rounded-xl hover:bg-transparent dark:hover:bg-transparent": commentButtonClicked,
					"h-10 hover:bg-sidebar-foreground/20 max-sm:h-auto max-sm:min-h-10 dark:hover:bg-sidebar-accent-foreground/10":
						!commentButtonClicked,
				},
			)}
		>
			<Form {...props.form}>
				<form className="w-full" onSubmit={props.form.handleSubmit(props.onHandleSubmit)}>
					<FormField
						control={props.form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										ref={commentTextAreaRef}
										required
										readOnly={!isClient || props.readOnly} // <-- make textarea readonly if not logged in
										onClick={props.onHandleOpenCommentButton}
										placeholder="Join in the conversation"
										className={cn(
											"rounded-xl border-none px-5 font-bricolage text-sm text-black shadow-none focus-within:border-none focus-visible:ring-0 md:text-sm dark:text-white",
											{
												"min-h-20 resize-y py-3 font-light": commentButtonClicked,
												"min-h-0 resize-none py-0 pt-2.5 max-sm:pt-4 max-sm:pb-1": !commentButtonClicked,
												"cursor-default": !isClient || props.readOnly,
											},
										)}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{commentButtonClicked && (
						<div className="relative bottom-0 flex h-15 w-full items-end justify-between gap-1 dark:bg-sidebar">
							<div className="flex w-full items-end justify-start gap-1 pb-2 pl-2 dark:bg-sidebar">
								<Button
									type="button"
									disabled={props.disabled}
									onClick={(e) => {
										e.stopPropagation();
									}}
									className="size-8 rounded-full bg-transparent p-0 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-sidebar-foreground/20 [&_svg]:size-auto"
								>
									<ImageIcon size={18} />
								</Button>
								<Button
									type="button"
									disabled
									onClick={(e) => {
										e.stopPropagation();
									}}
									className="size-8 rounded-full bg-transparent p-0 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-sidebar-foreground/20 [&_svg]:size-auto"
								>
									<CaseSensitive size={18} />
								</Button>
							</div>
							<div className="flex w-full items-end justify-end gap-1 pr-2 pb-2 dark:bg-sidebar">
								<Button
									disabled={props.disabled}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										props.onCancelComment();
										setCommentButtonClicked(false);
									}}
									className="rounded-full bg-sidebar-accent-foreground/30 px-5 py-2 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-sidebar-accent/50 dark:text-white dark:hover:bg-sidebar-foreground/20"
								>
									Cancel
								</Button>
								<Button
									disabled={props.disabled}
									type="submit"
									className="rounded-full bg-primary-500/70 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-primary-500 dark:bg-primary-500/80 dark:text-white dark:hover:bg-primary-500"
								>
									Comment
								</Button>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
});

export default CommentBox;
