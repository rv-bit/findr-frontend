import { useRouteLoaderData } from "react-router";
import type { loader as root } from "~/root";

export default function useRootLoader() {
	const rootData = useRouteLoaderData<typeof root>("root");

	return {
		...rootData,
	};
}
