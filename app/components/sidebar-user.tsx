import { useNavigate } from "react-router";

import { authClient } from "~/lib/auth";

import { ChevronsUpDown, LogOut, Moon } from "lucide-react";

import { useTheme } from "~/providers/Theme";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar";
import { Switch } from "~/components/ui/switch";
import { Button } from "./ui/button";

export function NavUser() {
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const { isMobile } = useSidebar();

	const handleChangeTheme = (themeValue: "dark" | "light") => {
		setTheme(themeValue);
	};

	const { data: session, isPending, error } = authClient.useSession();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				{!session?.user ? (
					<Button
						onClick={async () => {
							navigate("/login");
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
						<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
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
							<DropdownMenuItem
								onClick={(e) => {
									e.preventDefault();
								}}
								className="group w-full"
							>
								<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
									<Moon />
									<h1>Dark Mode</h1>
								</span>
								<Switch checked={theme === "dark"} onCheckedChange={(checked) => handleChangeTheme(checked ? "dark" : "light")} />
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={(e) => {
									e.preventDefault();
									authClient.signOut();
								}}
								className="group w-full hover:cursor-pointer"
							>
								<span className="flex w-full items-center justify-start gap-1 opacity-80 group-hover:opacity-100">
									<LogOut />
									<h1>Log out</h1>
								</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
