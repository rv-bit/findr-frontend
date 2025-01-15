import React from "react";
import { Link, useSearchParams } from "react-router";
import { type LucideIcon, ChevronDown, CircleArrowOutUpRight, Home } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~/components/ui/collapsible"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "~/components/ui/sidebar"

import { NavUser } from "./sidebar-user";
import { NavFooter } from "./sidebar-footer";

interface Actions {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	isCollapsible?: boolean;
	items?: Actions[];
}

const actions: Actions[] = [
	{
		title: "Main",
		url: "#",
		isCollapsible: false,
		items: [
			{
				title: "Home",
				url: "#",
				icon: Home,
			},
			{
				title: "Popular",
				url: "#",
				icon: CircleArrowOutUpRight,
			},
			{
				title: "Explore",
				url: "#",
				icon: Home,
			},
		]
	},
	{
		title: "Inbox",
		url: "#",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "Introduction",
				url: "#",
			},
			{
				title: "Get Started",
				url: "#",
			},
			{
				title: "Tutorials",
				url: "#",
			},
			{
				title: "Changelog",
				url: "#",
			},
		],
	},
	{
		title: "Settings",
		url: "#",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "General",
				url: "#",
			},
			{
				title: "Team",
				url: "#",
			},
			{
				title: "Billing",
				url: "#",
			},
			{
				title: "Limits",
				url: "#",
			},
		],
	},
];

export function SidebarActions() {
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<Sidebar variant="sidebar" collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{actions.map((item) => (
								!item.isCollapsible && (
									item.items?.map((action) => (
										<SidebarMenuItem key={action.title}>
											<Link to={action.url}>
												<SidebarMenuButton tooltip={action.title} size={"lg"} className="h-10">
													{action.icon && <action.icon size={32} />}
													<span>{action.title}</span>
												</SidebarMenuButton>
											</Link>
										</SidebarMenuItem>
									))
								)
							))}
						</SidebarMenu>
						<hr className="w-100 my-3 border-sidebar-border"></hr>
						<SidebarMenu className="gap-0">
							{actions.map((item, index) => {
								return (
									item.isCollapsible && (
										<React.Fragment key={index}>
											<Collapsible
												asChild
												defaultOpen={item.isActive}
												className="group/collapsible"
											>
												<SidebarMenuItem>
													<CollapsibleTrigger asChild>
														<SidebarMenuButton
															tooltip={item.title}
															size={"lg"}
															className="h-10"
														>
															{item.icon && <item.icon size={32} />}
															<span className="uppercase dark:text-neutral-300">{item.title}</span>
															<ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
														</SidebarMenuButton>
													</CollapsibleTrigger>
													<CollapsibleContent>
														<SidebarMenuSub>
															{item.items?.map((subItem, subIndex) => (
																<SidebarMenuSubItem key={subIndex}>
																	<SidebarMenuSubButton asChild size="lg">
																		<a href={subItem.url}>
																			<span>{subItem.title}</span>
																		</a>
																	</SidebarMenuSubButton>
																</SidebarMenuSubItem>
															))}
														</SidebarMenuSub>
													</CollapsibleContent>
												</SidebarMenuItem>
											</Collapsible>

											{index < actions.length - 1 && (
												<hr className="w-100 my-3 border-sidebar-border"></hr>
											)}
										</React.Fragment>
									)
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavFooter />
				<NavUser />
			</SidebarFooter>
		</Sidebar >
	);
}
