import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { QueryClientProvider } from "@tanstack/react-query";

import queryClient from "./lib/query/query-client";

import { ThemeProvider } from "~/providers/Theme";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { Topbar, TopbarInset, TopbarProvider } from "~/components/ui/topbar";

import SidebarActions from "~/components/sidebar-main";
import TopbarActions from "./components/topbar-actions";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthQueryProvider>
				<ThemeProvider>
					<TopbarProvider>
						<SidebarProvider>
							<Topbar>
								<TopbarInset>
									<TopbarActions />
								</TopbarInset>
							</Topbar>
							<SidebarActions />
							<SidebarInset>
								{children}
								<Toaster />
							</SidebarInset>
						</SidebarProvider>
					</TopbarProvider>
				</ThemeProvider>
			</AuthQueryProvider>
		</QueryClientProvider>
	);
}
