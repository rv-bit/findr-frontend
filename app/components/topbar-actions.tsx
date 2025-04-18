import React, { useState } from "react";
import { useNavigate } from "react-router";

import { useSession } from "~/hooks/use-auth";
import { authClient } from "~/lib/auth";

import { useTheme } from "~/providers/Theme";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandSeparator } from "~/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

import { type LucideIcon, LogOut, Moon, Plus, Settings, X } from "lucide-react";

import LogoIcon from "~/icons/logo";
import { Label } from "./ui/label";

interface DropDownActions {
	title: string;
	url?: string;
	icon?: LucideIcon;
	component?: React.FC;
	items?: DropDownActions[];
	onClick?: () => void;
}

const commands = [
	{ label: "Create Post", value: "/post/new" },
	{ label: "Ciew Profile", value: "/profile" },
	{ label: "Cettings", value: "/settings" },
	{ label: "Cogout", value: "/auth" },
];

function SearchBar() {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");

	const handleValueChange = React.useCallback((value: string) => {
		setInputValue(value);
		setOpen(!!value);
	}, []);

	const filteredCommands = Array.isArray(commands) ? commands.filter((command) => command.label.toLowerCase().includes(inputValue.toLowerCase())) : [];

	return (
		<Command className="relative w-full rounded-[1.2rem] bg-sidebar-foreground/20 shadow-md dark:bg-sidebar-accent">
			<div className={`relative ${open ? "rounded-tl-4xl rounded-tr-4xl border-t-0 border-r-0 border-b-[0.0625rem] border-l-0 border-solid border-sidebar-foreground/20 pb-[0.45rem]" : ""}`}>
				<Label
					htmlFor="search"
					className="flex h-10 w-full items-center justify-between gap-1 rounded-4xl bg-transparent px-3 py-2 text-sm placeholder:text-neutral-500 focus-within:border-2 focus-within:border-blue-500/60 hover:bg-sidebar-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400"
				>
					<CommandInput
						id="search"
						placeholder="Search in findr"
						value={inputValue}
						onValueChange={(e) => {
							handleValueChange(e);
						}}
						className="h-full w-full"
					/>

					{inputValue.length > 0 && (
						<Button
							onClick={() => {
								setInputValue("");
								setOpen(false);
							}}
							className="h-7 rounded-full bg-sidebar-foreground/20 px-1 py-2 text-black shadow-none hover:bg-sidebar-foreground/20 dark:bg-transparent dark:text-white hover:dark:bg-sidebar-foreground/20 [&_svg]:size-auto"
						>
							<X size={20} />
						</Button>
					)}
				</Label>
			</div>

			<CommandList className={`${open ? "block" : "hidden"}`}>
				{open && <CommandEmpty>No results found</CommandEmpty>}
				{filteredCommands &&
					filteredCommands.length > 0 &&
					filteredCommands.map((command) => {
						return (
							<React.Fragment key={command.value}>
								<CommandSeparator />
								<CommandItem
									onSelect={() => {
										// e.preventDefault();
										console.log(command.value);
									}}
								>
									{command.label}
								</CommandItem>
							</React.Fragment>
						);
					})}
			</CommandList>
		</Command>
	);
}

export default function TopbarActions() {
	const { isTablet } = useSidebar();

	const navigate = useNavigate();
	const { data: sessionData, isPending, refetch } = useSession();

	const [open, setOpen] = useState(false);

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
					await refetch();

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
			<section className="flex items-center justify-start gap-2">
				{isTablet && <SidebarTrigger className="rounded-full hover:bg-primary-500/15" />}

				<Button
					variant={"link"}
					onClick={() => {
						navigate("/");
					}}
					className="size-auto p-0 max-md:hidden [&_svg]:size-auto"
				>
					<LogoIcon width="70" height="40" />
				</Button>
			</section>

			<section className="flex max-h-10 w-120 items-start justify-center gap-2">
				<SearchBar />
			</section>

			<section className="flex items-center justify-end gap-2">
				{!sessionData?.user ? (
					<Button
						onClick={async () => {
							navigate("/auth");
						}}
						type="button"
						className="h-10 rounded-full bg-primary-500/75 hover:bg-primary-500 dark:bg-primary-500/75 dark:text-white dark:hover:bg-primary-500"
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
							className="flex h-9 items-center justify-center rounded-full bg-transparent px-4 text-black shadow-none hover:bg-sidebar-foreground/20 max-md:px-1 dark:bg-transparent dark:text-white dark:hover:bg-sidebar-accent [&_svg]:size-auto"
						>
							<Plus size={28} />
							<span className="block truncate text-sm capitalize max-md:hidden">Create</span>
						</Button>

						<DropdownMenu open={open} onOpenChange={setOpen}>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton variant={"link"} size="lg" className="h-auto rounded-full p-1 hover:bg-sidebar-foreground/20 hover:text-white dark:hover:bg-sidebar-accent">
									<Avatar className="h-8 w-8 rounded-full">
										{!isPending && <AvatarImage src={`${import.meta.env.VITE_CLOUD_FRONT_URL}/${sessionData?.user.image}`} alt={sessionData?.user.name} />}
										<AvatarFallback className="rounded-lg bg-sidebar-foreground/50">
											{sessionData?.user.name
												?.split(" ")
												.map((name) => name[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="mt-3.5 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-none dark:bg-modal" side={"bottom"} align="end" sideOffset={4}>
								<DropdownMenuLabel className="p-0 font-normal">
									<Button
										onClick={() => {
											navigate("/profile");
											setOpen(false);
										}}
										variant={"link"}
										className="flex h-auto w-full items-center justify-center gap-2 px-3 text-left text-sm opacity-80 hover:no-underline hover:opacity-100"
									>
										<Avatar className="h-8 w-8 rounded-full">
											{!isPending && <AvatarImage src={`${import.meta.env.VITE_CLOUD_FRONT_URL}/${sessionData?.user.image}`} alt={sessionData?.user.name} />}
											<AvatarFallback className="rounded-full">
												{sessionData?.user.name
													?.split(" ")
													.map((name) => name[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">View Profile</span>
											<span className="truncate text-xs">{sessionData?.user.username!}</span>
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
													className="group h-auto w-full px-3 py-2 text-left hover:cursor-pointer"
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
												className="group w-full px-3 py-2 text-left hover:cursor-pointer"
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
			</section>
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
				className="data-[state=checked]:bg-primary-400 dark:data-[state=checked]:bg-primary-400"
			/>
		</>
	);
}
