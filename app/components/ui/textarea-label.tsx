import { cn } from "~/lib/utils";

import { Textarea } from "./textarea";

export default function TextareaLabel({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<div className="group relative flex h-auto w-full flex-col">
			<label
				htmlFor={props.id}
				className="text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 left-2 block origin-top -translate-y-1/2 cursor-text px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-4 group-focus-within:left-2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-4 has-[+input:not(:placeholder-shown)]:left-2 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
			>
				<span
					className={cn("relative capitalize", {
						"after:text-red-500 after:content-['*']": props.required,
					})}
				>
					{props.name}
				</span>
			</label>
			<Textarea id={props.id} className={cn("pb-1 group-focus-within:pt-5.5", className)} placeholder="" {...props} />
		</div>
	);
}
