import React, { useRef, useState } from "react";
import { Link, NavLink, useLocation, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	sidebarMenuButtonVariants,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	sidebarSubMenuButtonVariants,
	useSidebar,
} from "~/components/ui/sidebar";
import { Button } from "./ui/button";

import { type LucideIcon, ChevronDown, CircleHelp, Plus, Scale, UsersRound } from "lucide-react";
import { type IconType } from "react-icons";

import { GoHomeFill } from "react-icons/go";
import { RiUserCommunityLine } from "react-icons/ri";

enum SearchQueries {
	HOME = "home",
	POPULAR = "popular",
	EXPLORE = "explore",
}

enum Routes {
	HOME = "/",
	EXPLORE = "/explore",
	NEW_COMMUNITY = "/communities/new",
	HELP = "/help",
	LEGAL = "/legal",
}

interface Actions {
	title: string;
	url?: string;
	searchKey?: string;
	searchQuery?: string;
	icon?: LucideIcon | IconType;
	iconSize?: number | string;
	isActive?: boolean;
	isCollapsible?: boolean;
	isDisabled?: boolean;
	isAction?: boolean;
	items?: Actions[];
}

const actions: Actions[] = [
	{
		title: "Main",
		isCollapsible: false,
		items: [
			{
				title: "Home",
				url: Routes.HOME,

				searchKey: "feed",
				searchQuery: SearchQueries.HOME,

				icon: GoHomeFill,
				iconSize: 24,
			},
			{
				title: "Popular",
				url: Routes.HOME,

				searchKey: "feed",
				searchQuery: SearchQueries.POPULAR,

				icon: RiUserCommunityLine,
				iconSize: 24,
			},
			{
				title: "Explore",
				url: Routes.EXPLORE,

				icon: UsersRound,
				isDisabled: true,
			},
		],
	},
	{
		title: "Recent",
		isActive: true,
		isCollapsible: true,
		items: [
			// dynamically generated
		],
	},
	{
		title: "Communities",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "Create a Community",
				url: Routes.NEW_COMMUNITY,
				icon: Plus,

				isDisabled: true,
			},
			// dynamically generated
		],
	},
	{
		title: "Resources",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "Help",
				url: Routes.HELP,
				icon: CircleHelp,

				isDisabled: false,
			},
			{
				title: "Privacy Policy",
				url: Routes.LEGAL,
				icon: Scale,

				isDisabled: false,
			},
		],
	},
];

export default function SidebarActions({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation();

	const { isTablet, setOpenTablet } = useSidebar();
	const [searchParams, setSearchParams] = useSearchParams();

	const pathname =
		location.pathname.endsWith("/") && location.pathname.lastIndexOf("/") !== 0
			? location.pathname.substring(0, location.pathname.lastIndexOf("/"))
			: location.pathname;

	return (
		<Sidebar variant="sidebar" collapsible="offcanvas" className="group">
			<SidebarContent className="mr-[0.175rem] p-2 pr-3 group-data-[collapsible=offcanvas]:hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:invisible [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:group-hover:visible dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500/50 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-transparent">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="gap-0">
							{actions.map(
								(item) =>
									!item.isCollapsible &&
									item.items?.map((action) => (
										<SidebarMenuItem key={action.title}>
											<NavLink
												viewTransition
												to={{
													pathname: action.url ?? "/",
													search: action.searchKey ? `?${action.searchKey}=${action.searchQuery}` : "",
												}}
												onClick={(e: React.MouseEvent) => {
													if (action.isDisabled) {
														e.preventDefault();
														return;
													}

													if (isTablet) setOpenTablet(false);
												}}
												className={({}) => {
													const isActive = action.searchQuery
														? searchParams.get(action.searchKey ? action.searchKey : "feed")?.toLowerCase() ===
															action.searchQuery.toLowerCase()
															? true
															: false
														: action.url === pathname
															? true
															: false;

													return cn(
														sidebarMenuButtonVariants({
															variant: "default",
															size: "default",
														}),
														"flex h-10 items-center gap-2 rounded-md px-4",
														{
															"cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent":
																action.isDisabled,
															"bg-sidebar-foreground/15 hover:bg-sidebar-foreground/15 dark:bg-sidebar-accent dark:hover:bg-sidebar-accent":
																isActive && !action.isDisabled,
															"hover:bg-sidebar-accent/40 dark:hover:bg-sidebar-accent/40":
																!isActive && !action.isDisabled,
														},
													);
												}}
											>
												<div className="flex size-6 items-center justify-center">
													{action.icon && (
														<action.icon
															size={action.iconSize}
															className={
																(cn("h-full w-full transition-colors delay-75 duration-200 ease-in-out"),
																action.searchQuery
																	? searchParams.get("feed")?.toLowerCase() === action.searchQuery.toLowerCase()
																		? "fill-black dark:fill-white"
																		: ""
																	: action.url === pathname
																		? "fill-black dark:fill-white"
																		: "")
															}
														/>
													)}
												</div>
												<span>{action.title}</span>
											</NavLink>
										</SidebarMenuItem>
									)),
							)}
						</SidebarMenu>
						<hr className="my-3 w-100 border-sidebar-border"></hr>
						<SidebarMenu className="gap-0">
							{actions.map((item, index) => {
								return (
									item.isCollapsible && (
										<CollapsibleItem
											key={index}
											item={item}
											index={index}
											searchParams={searchParams}
											pathname={pathname}
											isTablet={isTablet}
											setOpenTablet={setOpenTablet}
										/>
									)
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className="flex items-center justify-center p-3 px-5 pt-1 pb-1">
					<span className="text-xs text-neutral-500 hover:cursor-pointer hover:underline dark:text-neutral-400">
						findr @ 2025 - All rights reserved
					</span>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}

type CollapsibleItemProps = React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
	item: Actions;
	index: number;

	searchParams: URLSearchParams;
	pathname: string;
	isTablet: boolean;
	setOpenTablet: (open: boolean) => void;
};

function CollapsibleItem({ ...props }: CollapsibleItemProps) {
	const contentRef = useRef<HTMLUListElement | null>(null);
	const [isOpen, setIsOpen] = useState(props.item.isActive);

	return (
		<React.Fragment>
			<Collapsible asChild defaultOpen={props.item.isActive} className="group/collapsible">
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							tooltip={props.item.title}
							size={"lg"}
							className="flex h-10 items-center justify-between"
							onClick={() => setIsOpen(!isOpen)}
						>
							<div className="flex items-center gap-2">
								{props.item.icon && <props.item.icon size={32} />}
								<span className="text-xs tracking-wider uppercase dark:text-neutral-300">{props.item.title}</span>
							</div>
							<ChevronDown className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent className="transition-opacity duration-300 data-[state=closed]:animate-accordion-up data-[state=closed]:opacity-0 data-[state=open]:animate-accordion-down data-[state=open]:opacity-100">
						<SidebarMenuSub ref={contentRef}>
							{props.item.items?.map((subItem, subIndex) => (
								<SidebarMenuSubItem key={subIndex}>
									<SidebarMenuSubButton asChild className="[&>svg]:size-auto">
										{subItem.url ? (
											<Link
												viewTransition
												to={{
													pathname: subItem.url ?? "/",
													search: subItem.searchKey ? `?${subItem.searchKey}=${subItem.searchQuery}` : "",
												}}
												onClick={(e: React.MouseEvent) => {
													if (subItem.isDisabled) {
														e.preventDefault();
														return;
													}

													if (props.isTablet) props.setOpenTablet(false);
												}}
												className={cn(
													sidebarSubMenuButtonVariants({
														variant: "default",
														size: "default",
													}),
													"flex h-10 items-center justify-start gap-2 rounded-md px-4",
													{
														"cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent":
															subItem.isDisabled ? true : false,
														"hover:bg-sidebar-accent/40 dark:hover:bg-sidebar-accent/40": !subItem.isDisabled,
													},
												)}
											>
												{subItem.icon && <subItem.icon size={25} />}
												<span>{subItem.title}</span>
											</Link>
										) : (
											<Button
												disabled={subItem.isDisabled}
												variant={"link"}
												className="w-full items-center justify-start gap-2 p-0 [&_svg]:size-auto"
											>
												{subItem.icon && <subItem.icon size={25} />}
												<h1>{subItem.title}</h1>
											</Button>
										)}
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
			{props.index < actions.length - 1 && <hr className="my-3 w-100 border-sidebar-border"></hr>}
		</React.Fragment>
	);
}
