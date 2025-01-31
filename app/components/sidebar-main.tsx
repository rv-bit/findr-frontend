import React, { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

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
} from "~/components/ui/sidebar";

import { Button } from "./ui/button";

interface Actions {
	title: string;
	url?: string;
	searchQuery?: string;
	search?: string;
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
				icon: Plus,
				url: "/communities/new",
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
				url: "/help",
				icon: CircleHelp,
			},
			{
				title: "Privacy Policy",
				url: "/legal",
				icon: Scale,
			},
			// dynamically generated
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
						<SidebarMenuButton tooltip={item.title} size={"lg"} className="h-10 flex items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
							<div className="flex items-center gap-2">
								{item.icon && <item.icon size={32} />}
								<span className="text-xs uppercase tracking-wider dark:text-neutral-300">{item.title}</span>
							</div>
							<ChevronDown className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub
							ref={contentRef}
							style={{
								height: "auto",
								transition: "height 333ms ease",
							}}
						>
							{item.items?.map((subItem, subIndex) => (
								<SidebarMenuSubItem key={subIndex}>
									<SidebarMenuSubButton asChild size="lg">
										<Button variant={"link"} disabled={subItem.isDisabled} className="w-full h-auto items-center justify-start hover:no-underline pl-3">
											{subItem.url ? (
												<Link to={subItem.url} className="w-full flex items-center justify-start gap-2 p-0 [&_svg]:size-auto">
													{subItem.icon && <subItem.icon size={25} />}
													<span>{subItem.title}</span>
												</Link>
											) : (
												<Button
													variant={"link"}
													onClick={() => {
														console.log("clicked");
													}}
													className="w-full items-center justify-start gap-2 p-0 [&_svg]:size-auto"
												>
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
			{index < actions.length - 1 && <hr className="w-100 my-3 border-sidebar-border"></hr>}
		</React.Fragment>
	);
}

export default function SidebarActions() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<Sidebar variant="sidebar" collapsible="offcanvas" className="group">
			<SidebarContent className="p-2 pr-3 [&::-webkit-scrollbar-thumb]:invisible group-hover:[&::-webkit-scrollbar-thumb]:visible [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500/50 [&::-webkit-scrollbar-thumb]:rounded-lg mr-[0.175rem]">
				<SidebarGroup>
					<SidebarGroupContent>
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
												disabled={action.isDisabled}
												className={cn(
													"flex h-10 items-center gap-2 px-4 hover:bg-sidebar-foreground/5 data-[active=true]:hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-accent/50 dark:data-[active=true]:hover:bg-sidebar-accent",
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
								return item.isCollapsible && <CollapsibleItem key={index} item={item} index={index} />;
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className="flex items-center justify-center p-3 px-5 pt-1 pb-1">
					<span className="hover:underline hover:cursor-pointer text-neutral-500 dark:text-neutral-400 text-xs">findr @ 2025 - All rights reserved</span>
				</div>
			</SidebarContent>

			{/* <SidebarFooter>
				<NavFooter />
			</SidebarFooter> */}
		</Sidebar>
	);
}
