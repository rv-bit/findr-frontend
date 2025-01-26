import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"), // This is the default route which will be the home page
	route("legal", "routes/legal.tsx"),

	...prefix("auth", [
		index("./routes/auth/login.tsx"), // This is the default route which will be the login page
		route("onboard", "./routes/auth/onboard.tsx"),
		route("forgot-password", "./routes/auth/forgot-password.tsx"),
		route("verify-email", "./routes/auth/verify-email.tsx"),
	]),

	...prefix("settings", [
		layout("./routes/settings/_layout.tsx", [
			index("./routes/settings/account/index.tsx", { id: "index-settings" }), // This is the default route which will be the account page
			route("account", "./routes/settings/account/index.tsx"),
			route("profile", "./routes/settings/profile.tsx"),
		]),
	]),
] satisfies RouteConfig;
