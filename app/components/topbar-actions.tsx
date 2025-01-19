import React from "react";
import { SidebarTrigger } from "./ui/sidebar";

export default function TopbarActions() {
	return (
		<header
			style={{
				minHeight: "100%",
				width: "100%",
			}}
		>
			<div className="flex items-center justify-start gap-2">
				<SidebarTrigger />
				<h1 className="text-2xl font-bold">React Router</h1>
			</div>
		</header>
	);
}
