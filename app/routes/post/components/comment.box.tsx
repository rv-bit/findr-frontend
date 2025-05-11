import React from "react";
import { type UseFormReturn } from "react-hook-form";

import { cn } from "~/lib/utils";

import { CaseSensitive, ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

type CommentBoxProps = React.ComponentProps<"div"> & {
	open?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	placeholder?: string;
	maxLength?: number;

	form: UseFormReturn<any>;

	onHandleOpenCommentButton?: () => void;
	onHandleSubmit: (data: any) => void;
	onCancelComment: () => void;
};

const CommentBox = React.forwardRef<HTMLTextAreaElement, CommentBoxProps>(({ className, ...props }, commentTextAreaRef) => {
	const [commentButtonClicked, setCommentButtonClicked] = React.useState(props.open || false);

	React.useEffect(() => {
		if (props.open) {
			if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
				commentTextAreaRef.current.scrollIntoView({
					block: "center",
					behavior: "smooth",
				});

				commentTextAreaRef.current.focus();
			}
		}
	}, [props, commentTextAreaRef]);

	return (
		<Form {...props.form}>
			<form
				onClick={(e) => {
					props.onHandleOpenCommentButton && props.onHandleOpenCommentButton();

					if (!props.readOnly) {
						setCommentButtonClicked(true);
					}
				}}
				onSubmit={props.form.handleSubmit(props.onHandleSubmit)}
				className={cn(
					"group relative flex h-auto cursor-default flex-col items-center justify-between overflow-hidden rounded-full border border-neutral-500/50 bg-transparent p-0 font-bricolage text-black focus-within:border-neutral-500 dark:border-white/50 dark:bg-transparent dark:text-white focus-within:dark:border-white",
					{
						"min-h-35 items-start rounded-xl hover:bg-transparent dark:hover:bg-transparent": commentButtonClicked,
						"h-10 min-h-10 hover:bg-sidebar-foreground/20 dark:hover:bg-sidebar-accent-foreground/10": !commentButtonClicked,
					},
				)}
			>
				<FormField
					control={props.form.control}
					name="content"
					render={({ field }) => (
						<FormItem
							className={cn("flex h-full w-full flex-col items-start justify-start gap-2 space-y-0 px-5", {
								"justify-center": !commentButtonClicked,
							})}
						>
							<FormControl>
								<Textarea
									{...field}
									ref={commentTextAreaRef}
									readOnly={props.readOnly}
									placeholder={props.placeholder ?? "Join in the conversation"}
									maxLength={props.maxLength ?? undefined}
									onClick={() => {
										props.onHandleOpenCommentButton && props.onHandleOpenCommentButton();
									}}
									className={cn(
										"min-h-auto rounded-xl border-none p-0 font-bricolage text-sm text-black shadow-none focus-within:border-none focus-visible:ring-0 md:text-sm dark:text-white",
										{
											"h-auto min-h-30 resize-y py-3 font-light": commentButtonClicked,
											"resize-none": !commentButtonClicked,
											"cursor-default": props.readOnly,
										},
									)}
									style={{
										height: commentButtonClicked ? "auto" : "1.25rem",
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{commentButtonClicked && (
					<div className="relative bottom-0 flex h-15 w-full items-end justify-between gap-1 px-2 pb-2 dark:bg-sidebar">
						<div className="flex w-full items-end justify-start gap-1 dark:bg-sidebar">
							<Button
								type="button"
								disabled
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
						<div className="flex w-full items-end justify-end gap-1 dark:bg-sidebar">
							<Button
								disabled={props.disabled}
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									props.onCancelComment();

									setCommentButtonClicked(false);

									if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
										commentTextAreaRef.current.value = "";
										commentTextAreaRef.current.style.height = "auto";
										commentTextAreaRef.current.blur();
									}
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
	);
});

export default CommentBox;
