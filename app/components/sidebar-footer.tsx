import { useTheme } from "~/providers/Theme";

import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"

import { SidebarInput, SidebarMenuButton, useSidebar } from "~/components/ui/sidebar";
import { Label } from "./ui/label";

export function NavFooter() {
	const { theme, setTheme } = useTheme();
	const { isMobile } = useSidebar();

	console.log(theme);

	const handleChangeTheme = (themeValue: 'dark' | 'light') => {
		setTheme(themeValue);
	}

	return (
		<>
			<Card className="shadow-none">
				<form>
					<CardHeader className="p-4 pb-0">
						<CardTitle className="text-sm">Subscribe to our newsletter</CardTitle>
						<CardDescription>Opt-in to receive updates and news about the sidebar.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-2.5 p-4">
						<SidebarInput type="email" placeholder="Email" />
						<Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none" size="sm">
							Subscribe
						</Button>
					</CardContent>
				</form>
			</Card>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">Settings</span>
						</div>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
					<RadioGroup
						onValueChange={handleChangeTheme}
						value={theme}
						className="flex flex-col space-y-1 p-2 justify-start items-start"
					>
						<div className="flex items-center space-x-3 space-y-0">
							<RadioGroupItem value="light" id="light" />
							<Label htmlFor="light">Light</Label>
						</div>

						<div className="flex items-center space-x-3 space-y-0">
							<RadioGroupItem value="dark" id="dark" />
							<Label htmlFor="dark">Dark</Label>
						</div>
					</RadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}