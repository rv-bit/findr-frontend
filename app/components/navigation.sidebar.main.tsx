import React, { useRef, useState } from "react";
import { Form, Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import { type LucideIcon, ChevronDown, CircleHelp, Plus, Scale, UsersRound } from "lucide-react";
import { type IconType } from "react-icons";

import { GoHomeFill } from "react-icons/go";
import { RiUserCommunityLine } from "react-icons/ri";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "~/components/ui/sidebar";

import { Button } from "./ui/button";

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
			},
			{
				title: "Privacy Policy",
				url: Routes.LEGAL,
				icon: Scale,
			},
		],
	},
];

function CollapsibleItem({ item, index }: { item: Actions; index: number }) {
	const contentRef = useRef<HTMLUListElement | null>(null);
	const [isOpen, setIsOpen] = useState(item.isActive);

	return (
		<React.Fragment>
			<Collapsible asChild defaultOpen={item.isActive} className="group/collapsible">
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							tooltip={item.title}
							size={"lg"}
							className="flex h-10 items-center justify-between"
							onClick={() => setIsOpen(!isOpen)}
						>
							<div className="flex items-center gap-2">
								{item.icon && <item.icon size={32} />}
								<span className="text-xs tracking-wider uppercase dark:text-neutral-300">{item.title}</span>
							</div>
							<ChevronDown className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent className="transition-opacity duration-300 data-[state=closed]:animate-accordion-up data-[state=closed]:opacity-0 data-[state=open]:animate-accordion-down data-[state=open]:opacity-100">
						<SidebarMenuSub ref={contentRef}>
							{item.items?.map((subItem, subIndex) => (
								<SidebarMenuSubItem key={subIndex}>
									<SidebarMenuSubButton asChild size="lg">
										<Button
											variant={"link"}
											disabled={subItem.isDisabled}
											className="h-auto w-full items-center justify-start pl-3 hover:no-underline"
										>
											{subItem.url ? (
												<Link to={subItem.url} className="flex w-full items-center justify-start gap-2 p-0 [&_svg]:size-auto">
													{subItem.icon && <subItem.icon size={25} />}
													<span>{subItem.title}</span>
												</Link>
											) : (
												<Button variant={"link"} className="w-full items-center justify-start gap-2 p-0 [&_svg]:size-auto">
													{subItem.icon && <subItem.icon size={28} />}
													<h1>{subItem.title}</h1>
												</Button>
											)}
										</Button>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
			{index < actions.length - 1 && <hr className="my-3 w-100 border-sidebar-border"></hr>}
		</React.Fragment>
	);
}

export default function SidebarActions() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isTablet, setOpenTablet } = useSidebar();

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
											<Form method="get" action={action.url} className="w-full">
												<SidebarMenuButton
													name={action.searchKey ?? ""}
													value={action.searchQuery ?? ""}
													size="lg"
													isActive={
														action.searchQuery
															? searchParams.get("feed")?.toLowerCase() === action.searchQuery.toLowerCase()
																? true
																: false
															: action.url === pathname
																? true
																: false
													}
													onClick={(e) => {
														if (isTablet) setOpenTablet(false);
													}}
													disabled={action.isDisabled}
													className="flex h-10 items-center gap-2 px-4 hover:bg-sidebar-foreground/5 data-[active=true]:hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50 dark:data-[active=true]:hover:bg-sidebar-accent"
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
												</SidebarMenuButton>
											</Form>
										</SidebarMenuItem>
									)),
							)}
						</SidebarMenu>
						<hr className="my-3 w-100 border-sidebar-border"></hr>
						<SidebarMenu className="gap-0">
							{actions.map((item, index) => {
								return item.isCollapsible && <CollapsibleItem key={index} item={item} index={index} />;
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
