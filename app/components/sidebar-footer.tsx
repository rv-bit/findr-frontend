import { useTheme } from "~/providers/Theme";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"

import { SidebarMenuButton, useSidebar } from "~/components/ui/sidebar";
import { Label } from "./ui/label";

export function NavFooter() {
	const { theme, setTheme } = useTheme();
	const { isMobile } = useSidebar();

	const handleChangeTheme = (themeValue: 'dark' | 'light') => {
		setTheme(themeValue);
	}

	return (
		<>
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