import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("legal", "routes/legal.tsx"),

	route("login", "./routes/auth/login.tsx"),
	route("onboard", "./routes/auth/onboard.tsx"),

	route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
