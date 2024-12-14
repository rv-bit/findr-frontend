import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"), // This is the default route

	route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
