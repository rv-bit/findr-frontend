import { cn } from "~/lib/utils";

import { Input } from "./input";

export default function InputLabel({ className, labelClassName, ...props }: React.ComponentProps<"input"> & { labelClassName?: string | undefined }) {
	return (
		<div className="group relative w-full">
			<label
				htmlFor={props.id}
				className="text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 left-2 block origin-top -translate-y-1/2 cursor-text px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-3 group-focus-within:left-2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-4 has-[+input:not(:placeholder-shown)]:left-2 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
			>
				<span className={cn("relative", labelClassName)}>{props.name}</span>
			</label>
			<Input id={props.id} type={props.type} className={cn("pt-7.5 pb-5", className)} placeholder="" {...props} />
		</div>
	);
}
