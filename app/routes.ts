import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"), // This is the default route

	layout("./routes/auth/layout.tsx", [
		route("login", "./routes/auth/login.tsx"),
		route("register", "./routes/auth/register.tsx"),
	]),

	route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
