import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { cn } from "~/lib/utils";

import { type LucideIcon, ChevronDown, UsersRound } from "lucide-react";
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

import { NavFooter } from "./sidebar-footer";
import { Button } from "./ui/button";

interface Actions {
	title: string;
	url: string;
	searchQuery?: string;
	search?: string;
	icon?: LucideIcon | IconType;
	iconSize?: number | string;
	isActive?: boolean;
	isCollapsible?: boolean;
	isDisabled?: boolean;
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
				isDisabled: true,
			},
			{
				title: "Get Started",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Tutorials",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Changelog",
				url: "#",
				isDisabled: true,
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
				isDisabled: true,
			},
			{
				title: "Team",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Billing",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Limits",
				url: "#",
				isDisabled: true,
			},
		],
	},
	{
		title: "Settings2",
		url: "#",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "General",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Team",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Billing",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Limits",
				url: "#",
				isDisabled: true,
			},
		],
	},
	{
		title: "Settings3",
		url: "#",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "General",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Team",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Billing",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Limits",
				url: "#",
				isDisabled: true,
			},
		],
	},
	{
		title: "Settings4",
		url: "#",
		isActive: true,
		isCollapsible: true,
		items: [
			{
				title: "General",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Team",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Billing",
				url: "#",
				isDisabled: true,
			},
			{
				title: "Limits",
				url: "#",
				isDisabled: true,
			},
		],
	},
];

function CollapsibleItem({ item, index }: { item: Actions; index: number }) {
	const contentRef = useRef<HTMLUListElement | null>(null);
	const [isOpen, setIsOpen] = useState(item.isActive);

	const [overflowY, setOverflowY] = useState<string>("hidden");
	const [height, setHeight] = useState<string>("0px");
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (!contentRef.current) return;

		const contentHeight = contentRef.current.scrollHeight;

		if (isOpen) {
			// When opening
			setHeight(`${contentHeight}px`);
			setIsAnimating(true);

			// After the animation, set height to "auto" to handle content resizing
			const timeout = setTimeout(() => {
				setHeight("auto");
				setOverflowY("visible");
				setIsAnimating(false);
			}, 333); // Match the transition duration
			return () => clearTimeout(timeout);
		} else {
			// When closing
			setHeight(`${contentHeight}px`); // Start with current height
			setTimeout(() => {
				// setHeight("0px"); // Collapse to zero
				setOverflowY("visible");
				setIsAnimating(true);
			}, 5); // Delay to trigger reflow and start transition

			const timeout = setTimeout(() => {
				setHeight("0px");
				setOverflowY("hidden");
				setIsAnimating(false);
			}, 333); // Match the transition duration
			return () => clearTimeout(timeout);
		}
	}, [isOpen]);

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
								height: height,
								overflow: overflowY,
								transition: "height 333ms ease",
							}}
						>
							{item.items?.map((subItem, subIndex) => (
								<SidebarMenuSubItem key={subIndex}>
									<SidebarMenuSubButton asChild size="lg">
										<Button variant={"link"} disabled={subItem.isDisabled} className="w-full h-auto items-center justify-start">
											<Link to={subItem.url}>
												<span>{subItem.title}</span>
											</Link>
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
		<Sidebar variant="sidebar" collapsible="offcanvas">
			<SidebarContent className="p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb]:rounded-lg mr-0.5">
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
								return item.isCollapsible && <CollapsibleItem key={index} item={item} index={index} />;
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavFooter />
			</SidebarFooter>
		</Sidebar>
	);
}
