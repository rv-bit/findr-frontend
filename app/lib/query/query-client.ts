import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 1, // 1 minute
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
		},
	},
});
