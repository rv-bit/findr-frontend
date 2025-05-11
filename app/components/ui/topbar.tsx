import React from "react";

import { cn } from "~/lib/utils";

const Topbar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {}>(({ className, style, children, ...props }, ref) => {
	return (
		<nav className={cn("fixed z-10 h-[var(--nav-height)] w-full border-b border-sidebar-accent bg-sidebar px-4", className)} ref={ref} {...props}>
			{children}
		</nav>
	);
});

const TopbarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {}>(({ className, style, children, ...props }, ref) => {
	return (
		<div
			style={
				{
					...style,
				} as React.CSSProperties
			}
			className={cn("flex min-h-full items-center", className)}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	);
});

export { Topbar, TopbarInset };
