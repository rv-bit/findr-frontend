import { QueryClient } from "@tanstack/react-query";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

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

function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
	return {
		persistClient: async (client: PersistedClient) => {
			await set(idbValidKey, client);
		},
		restoreClient: async () => {
			return await get<PersistedClient>(idbValidKey);
		},
		removeClient: async () => {
			await del(idbValidKey);
		},
	} as Persister;
}
export const persister = createIDBPersister();

export default queryClient;
