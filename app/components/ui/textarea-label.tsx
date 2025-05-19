import { cn } from "~/lib/utils";

import { Textarea } from "./textarea";

export default function TextareaLabel({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<div className="group relative w-full">
			<label
				htmlFor={props.id}
				className="text-muted-foreground group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground absolute top-1/2 left-2 block origin-top -translate-y-1/2 cursor-text px-1 transition-all group-focus-within:pointer-events-none group-focus-within:top-4 group-focus-within:left-2 group-focus-within:cursor-default group-focus-within:text-sm group-focus-within:font-medium has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:top-5 has-[+textarea:not(:placeholder-shown)]:left-2 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:font-medium"
			>
				<span
					className={cn("relative text-black capitalize dark:text-white", {
						"after:text-red-500 after:content-['*']": props.required,
					})}
				>
					{props.name}
				</span>
			</label>
			<Textarea id={props.id} className={cn("py-0 pt-6", className)} placeholder="" {...props} />
		</div>
	);
}
