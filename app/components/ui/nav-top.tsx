import React from "react";

import { cn } from "~/lib/utils";

const NavigationTopProvider = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, children, ...props }, ref) => {
	return (
		<nav
			className={cn("fixed z-10 h-[var(--nav-height)] w-full border-b border-sidebar-accent bg-sidebar px-4", {}, className)}
			ref={ref}
			{...props}
		>
			{children}
		</nav>
	);
});

const NavigationTopInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"span"> & {}>(({ className, style, children, ...props }, ref) => {
	return (
		<span
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
		</span>
	);
});

export { NavigationTopInset, NavigationTopProvider };
