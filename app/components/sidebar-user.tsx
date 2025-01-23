import { useNavigate } from "react-router";

import { authClient } from "~/lib/auth";

import { type LucideIcon, ChevronsUpDown, LogOut, Moon, Settings } from "lucide-react";

import { useTheme } from "~/providers/Theme";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
import { Switch } from "~/components/ui/switch";
import { Button } from "./ui/button";

interface Actions {
	title: string;
	url?: string;
	icon?: LucideIcon;
	component?: React.FC;
	items?: Actions[];
	onClick?: () => void;
}

const actions: Actions[] = [
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
		onClick: () => {
			authClient.signOut();
		},
	},
];

export function NavUser() {
	const navigate = useNavigate();

	const { data: session, isPending, error } = authClient.useSession();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				{!session?.user ? (
					<Button
						onClick={async () => {
							navigate("/auth");
						}}
						type="button"
						className="h-10 w-full rounded-lg"
					>
						<span className="truncate text-sm capitalize">Login</span>
					</Button>
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
								<Avatar className="h-8 w-8 rounded-lg">
									{!isPending && <AvatarImage src={session?.user.image ?? undefined} alt={session?.user.name} />}
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{session?.user.name}</span>
									<span className="truncate text-xs">{session?.user.email}</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={"bottom"} align="end" sideOffset={4}>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={session?.user.image ?? undefined} alt={session?.user.name} />
										<AvatarFallback className="rounded-lg">CN</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{session?.user.name}</span>
										<span className="truncate text-xs">{session?.user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{actions.map((item) =>
								item.items ? (
									<DropdownMenuGroup key={item.title}>
										{item.items?.map((action) => (
											<DropdownMenuItem
												key={action.title}
												onClick={(e) => {
													e.preventDefault();

													if (action.url) {
														navigate(action.url);
														return;
													}

													if (action.onClick) {
														action.onClick();
													}
												}}
												className="group w-full hover:cursor-pointer"
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
													return;
												}

												if (item.onClick) {
													item.onClick();
												}
											}}
											className="group w-full hover:cursor-pointer"
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

										{actions.length - 1 !== actions.indexOf(item) && <DropdownMenuSeparator />}
									</DropdownMenuGroup>
								),
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
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
			<Switch checked={theme === "dark"} onCheckedChange={(checked) => handleChangeTheme(checked ? "dark" : "light")} />
		</>
	);
}
