import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"), // This is the default route which will be the home page
	route("legal", "routes/legal.tsx"),

	...prefix("auth", [
		index("./routes/auth/login.tsx"), // This is the default route which will be the login page
		route("onboard", "./routes/auth/onboard.tsx"),
		route("forgot-password", "./routes/auth/forgot-password.tsx"),
	]),

	...prefix("settings", [
		index("./routes/settings/index.tsx"), // This is the default route which will be the settings page
		// route("profile", "./routes/settings/profile.tsx"),
		// route("account", "./routes/settings/account.tsx"),
	]),
] satisfies RouteConfig;
