import React from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import queryClient, { idbPersister } from "./lib/query/query.client";

import { ThemeProvider } from "~/providers/Theme";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { Topbar, TopbarInset } from "~/components/ui/topbar";

import SidebarActions from "~/components/navigation.sidebar.main";
import TopbarActions from "~/components/navigation.top.main";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [searchParams, setSearchParams] = useSearchParams();

	React.useEffect(() => {
		if (searchParams.has("error")) {
			toast.error(<>{` ${decodeURIComponent(searchParams.get("error") ?? "")}`}</>, {
				duration: 5000,
				description: "Please try again later.",
			});
			setSearchParams((prev) => {
				prev.delete("error");
				return prev;
			});
		}
	}, [searchParams]);

	return (
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister: idbPersister }}>
			<AuthQueryProvider>
				<ThemeProvider>
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
				</ThemeProvider>
			</AuthQueryProvider>
		</PersistQueryClientProvider>
	);
}
