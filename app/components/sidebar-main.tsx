import React from "react";
import { useNavigate, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import { type LucideIcon, ChevronDown, CircleArrowOutUpRight, Home, UsersRound } from "lucide-react";
import { type IconType } from "react-icons";

import { GoHomeFill } from "react-icons/go";
import { RiUserCommunityLine } from "react-icons/ri";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";

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
} from "~/components/ui/sidebar";

import { NavUser } from "./sidebar-user";
import { NavFooter } from "./sidebar-footer";

interface Actions {
	title: string;
	url: string;
	searchQuery?: string;
	search?: string;
	icon?: LucideIcon | IconType;
	iconSize?: number | string;
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
				url: "/",

				searchQuery: "feed",
				search: "home",

				icon: GoHomeFill,
				iconSize: 24,
			},
			{
				title: "Popular",
				url: "/",

				searchQuery: "feed",
				search: "popular",

				icon: RiUserCommunityLine,
				iconSize: 24,
			},
			{
				title: "Explore",
				url: "/",

				searchQuery: "feed",

				search: "explore",
				icon: UsersRound,
			},
		],
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
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<Sidebar variant="sidebar" collapsible="offcanvas">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent className="p-2">
						<SidebarMenu className="gap-0">
							{actions.map(
								(item) =>
									!item.isCollapsible &&
									item.items?.map((action) => (
										<SidebarMenuItem key={action.title}>
											<SidebarMenuButton
												onClick={() => {
													navigate({
														pathname: action.url,
														search: `?${action.searchQuery}=${action.search}`,
													});
												}}
												size="lg"
												isActive={action.search && searchParams.get("feed")?.toLowerCase() === action.search.toLowerCase() ? true : false}
												className={cn(
													"flex h-12 items-center gap-2 px-4 hover:bg-sidebar-foreground/5 data-[active=true]:hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/30 dark:data-[active=true]:hover:bg-sidebar-accent",
												)}
											>
												<div className="flex size-6 items-center justify-center">
													{action.icon && (
														<action.icon
															size={action.iconSize}
															className={
																(cn("h-full w-full transition-colors delay-75 duration-200 ease-in-out"),
																action.search && searchParams.get("feed")?.toLowerCase() === action.search.toLowerCase() ? "fill-black dark:fill-white" : "")
															}
														/>
													)}
												</div>
												<span>{action.title}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									)),
							)}
						</SidebarMenu>
						<hr className="w-100 my-3 border-sidebar-border"></hr>
						<SidebarMenu className="gap-0">
							{actions.map((item, index) => {
								return (
									item.isCollapsible && (
										<React.Fragment key={index}>
											<Collapsible asChild defaultOpen={item.isActive} className="group/collapsible">
												<SidebarMenuItem>
													<CollapsibleTrigger asChild>
														<SidebarMenuButton tooltip={item.title} size={"lg"} className="h-10">
															{item.icon && <item.icon size={32} />}
															<span className="text-xs uppercase tracking-wider dark:text-neutral-300">{item.title}</span>
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

											{index < actions.length - 1 && <hr className="w-100 my-3 border-sidebar-border"></hr>}
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
		</Sidebar>
	);
}
