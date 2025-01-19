import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("legal", "routes/legal.tsx"),

	...prefix("auth", [
		index("./routes/auth/login.tsx"), // This is the default route which will be the login page
		route("onboard", "./routes/auth/onboard.tsx"),
		route("forgot-password", "./routes/auth/forgot-password.tsx"),
	]),

	route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
