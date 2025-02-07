import React, { useState } from "react";
import { useNavigate } from "react-router";

import { authClient } from "~/lib/auth";

import { useTheme } from "~/providers/Theme";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

import { type LucideIcon, LogOut, Moon, Plus, Settings } from "lucide-react";

import LogoIcon from "~/icons/logo";

interface DropDownActions {
	title: string;
	url?: string;
	icon?: LucideIcon;
	component?: React.FC;
	items?: DropDownActions[];
	onClick?: () => void;
}

export default function TopbarActions() {
	const [open, setOpen] = useState(false);

	const navigate = useNavigate();
	const { data: session, isPending, error } = authClient.useSession();

	const dropDownActions: DropDownActions[] = React.useMemo(
		() => [
			{
				title: "Other",
				items: [
					{
						title: "Dark Mode",
						component: DarkModeComponent,
					},
					{
						title: "Settings",
						url: "/settings",
						icon: Settings,
					},
				],
			},
			{
				title: "Log out",
				icon: LogOut,
				onClick: async () => {
					await authClient.signOut();

					navigate("/auth");
					setOpen(false);
				},
			},
		],
		[],
	);

	return (
		<header
			style={{
				minHeight: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				gap: "0.5rem",
			}}
		>
			<div className="flex items-center justify-start gap-2">
				<SidebarTrigger className="rounded-full hover:bg-primary-500/15" />

				<Button
					variant={"link"}
					onClick={() => {
						navigate("/");
					}}
					className="size-auto p-0 [&_svg]:size-auto"
				>
					<LogoIcon width="70" height="40" />
				</Button>
			</div>

			<div className="flex items-center justify-end gap-2">
				{!session?.user ? (
					<Button
						onClick={async () => {
							navigate("/auth");
						}}
						type="button"
						className="h-10 rounded-full bg-primary-500/75 hover:bg-primary-500 dark:bg-primary-500/75 dark:hover:bg-primary-500 dark:text-white"
					>
						<span className="truncate text-sm capitalize">Login</span>
					</Button>
				) : (
					<React.Fragment>
						<Button
							onClick={async () => {
								navigate(`/post/new/?type=text`);
							}}
							type="button"
							className="h-9 rounded-full shadow-none text-black bg-transparent dark:bg-transparent hover:bg-sidebar-foreground/20 dark:hover:bg-sidebar-accent dark:text-white flex justify-center items-center [&_svg]:size-auto"
						>
							<Plus size={28} />
							<span className="truncate text-sm capitalize">Create</span>
						</Button>

						<DropdownMenu open={open} onOpenChange={setOpen}>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton variant={"link"} size="lg" className="h-auto p-1 rounded-full hover:bg-sidebar-foreground/20 hover:text-white dark:hover:bg-sidebar-accent">
									<Avatar className="h-8 w-8 rounded-full">
										{!isPending && <AvatarImage src={`${import.meta.env.VITE_CLOUD_FRONT_URL}/${session?.user.image}`} alt={session?.user.name} />}
										<AvatarFallback className="rounded-lg bg-sidebar-foreground/50">
											{session?.user.name
												?.split(" ")
												.map((name) => name[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg dark:bg-modal border-none mt-3.5" side={"bottom"} align="end" sideOffset={4}>
								<DropdownMenuLabel className="p-0 font-normal">
									<Button
										onClick={() => {
											navigate("/profile");
											setOpen(false);
										}}
										variant={"link"}
										className="w-full h-auto flex items-center justify-center gap-2 px-3 text-left text-sm hover:no-underline opacity-80 hover:opacity-100"
									>
										<Avatar className="h-8 w-8 rounded-full">
											{!isPending && <AvatarImage src={`${import.meta.env.VITE_CLOUD_FRONT_URL}/${session?.user.image}`} alt={session?.user.name} />}
											<AvatarFallback className="rounded-full">
												{session?.user.name
													?.split(" ")
													.map((name) => name[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">View Profile</span>
											<span className="truncate text-xs">{session?.user.username!}</span>
										</div>
									</Button>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{dropDownActions.map((item) =>
									item.items ? (
										<DropdownMenuGroup key={item.title}>
											{item.items?.map((action) => (
												<DropdownMenuItem
													key={action.title}
													onClick={(e) => {
														e.preventDefault();

														if (action.url) {
															navigate(action.url);
															setOpen(false);
															return;
														}

														if (action.onClick) {
															action.onClick();
														}
													}}
													className="group w-full h-auto hover:cursor-pointer px-3 py-2 text-left"
												>
													{action.component ? (
														<action.component />
													) : (
														<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
															{action.icon && <action.icon />}
															<h1>{action.title}</h1>
														</span>
													)}
												</DropdownMenuItem>
											))}

											<DropdownMenuSeparator />
										</DropdownMenuGroup>
									) : (
										<DropdownMenuGroup key={item.title}>
											<DropdownMenuItem
												onClick={(e) => {
													e.preventDefault();

													if (item.url) {
														navigate(item.url);
														setOpen(false);
														return;
													}

													if (item.onClick) {
														item.onClick();
													}
												}}
												className="group w-full hover:cursor-pointer px-3 py-2 text-left"
											>
												{item.component ? (
													<item.component />
												) : (
													<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
														{item.icon && <item.icon />}
														<h1>{item.title}</h1>
													</span>
												)}
											</DropdownMenuItem>

											{dropDownActions.length - 1 !== dropDownActions.indexOf(item) && <DropdownMenuSeparator />}
										</DropdownMenuGroup>
									),
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</React.Fragment>
				)}
			</div>
		</header>
	);
}

function DarkModeComponent() {
	const { theme, setTheme } = useTheme();

	const handleChangeTheme = (themeValue: "dark" | "light") => {
		setTheme(themeValue);
	};

	return (
		<>
			<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
				<Moon />
				<h1>Dark Mode</h1>
			</span>
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(checked) => handleChangeTheme(checked ? "dark" : "light")}
				className="dark:data-[state=checked]:bg-primary-400 data-[state=checked]:bg-primary-400"
			/>
		</>
	);
}
