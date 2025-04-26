import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 1, // 1 minute
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
			gcTime: 1000 * 60 * 5, // 5 minutes
		},
	},
});

export default queryClient;
