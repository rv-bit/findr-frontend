import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"), // This is the default route which will be the home page
	route("legal", "routes/static/legal.tsx"), // This is the legal page which is a static page, so it doesn't need a layout and it pre renders the content at build time

	...prefix("auth", [
		index("./routes/auth/login.tsx"), // This is the default route which will be the login page
		route("onboard", "./routes/auth/onboard.tsx"),
		route("forgot-password", "./routes/auth/forgot-password.tsx"),
		route("two-factor", "./routes/auth/two-factor.tsx"),
		route("verify-email", "./routes/auth/verifications/verify-email.tsx"),
		route("verify-delete", "./routes/auth/verifications/verify-delete-account.tsx"),
	]),

	...prefix("settings", [
		layout("./routes/settings/_layout.tsx", [
			index("./routes/settings/account/index.tsx", { id: "index-settings" }), // This is the default route which will be the account page
			route("account", "./routes/settings/account/index.tsx"),
			route("profile", "./routes/settings/profile/index.tsx"),
			route("security", "./routes/settings/security/index.tsx"),
		]),
	]),

	...prefix("user", [route(":id", "./routes/user/index.tsx")]),
	...prefix("post", [route(":id", "./routes/post/index.tsx"), route("new", "./routes/post/new.tsx")]),
] satisfies RouteConfig;
