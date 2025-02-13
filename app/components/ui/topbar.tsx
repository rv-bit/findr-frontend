import React from "react";

import { cn } from "~/lib/utils";

export const TOPBAR_HEIGHT = "3.5rem";

const TopbarContext = React.createContext<null>(null);

const TopbarProvider = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {}>(({ className, style, children, ...props }, ref) => {
	return (
		<TopbarContext.Provider value={null}>
			<div
				style={
					{
						"--topbar-height": TOPBAR_HEIGHT,
						overflowX: "hidden",
						...style,
					} as React.CSSProperties
				}
				className={cn("min-h-svh w-full", className)}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		</TopbarContext.Provider>
	);
});

const Topbar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {}>(({ className, style, children, ...props }, ref) => {
	return (
		<div
			style={{
				height: "var(--topbar-height)",
			}}
			className={cn("fixed z-10 w-full border-b border-sidebar-accent bg-sidebar px-4", className)}
			ref={ref}
			{...props}
		>
			{children}
		</div>
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

export { Topbar, TopbarInset, TopbarProvider };
