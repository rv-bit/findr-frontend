import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import { ChevronRight, type LucideIcon } from "lucide-react";

interface WarningComponentProps {
	open: boolean;
	icon?: LucideIcon;
	message: string;
	title: string;
	description: string;

	disableContinue?: boolean;
	buttonType?: "button" | "submit";

	onContinue?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

	onChangeState?: () => void;

	children?: React.ReactNode;
}

export default function WarningComponent({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root> & WarningComponentProps) {
	return (
		<AlertDialog open={props.open} onOpenChange={props.onChangeState}>
			<AlertDialogTrigger asChild onClick={(e) => {}} className="mb-2">
				<Button
					variant={"destructive"}
					className="group flex h-12 w-full items-center justify-between gap-4 hover:bg-red-500/90 dark:bg-red-900/60 dark:text-neutral-50 dark:hover:bg-red-900/90"
				>
					<span className="flex items-center justify-center gap-2">
						{props.icon && <props.icon />}
						<h1>{props.message}</h1>
					</span>
					<ChevronRight size={24} />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>{props.title}</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">{props.description}</AlertDialogDescription>
				</AlertDialogHeader>
				{props.children && <section className="flex flex-col gap-2">{props.children}</section>}
				<AlertDialogFooter>
					{props.onCancel && (
						<AlertDialogCancel
							onClick={(e) => {
								props.onCancel!(e);
							}}
						>
							Cancel
						</AlertDialogCancel>
					)}
					{props.onContinue && (
						<AlertDialogAction
							disabled={props.disableContinue}
							type={props.buttonType || "button"}
							onClick={(e) => {
								props.onContinue!(e);
							}}
						>
							Continue
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
