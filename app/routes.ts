import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	index("routes/home/page.tsx"), // This is the default route which will be the home page

	...prefix("explore", [
		index("./routes/explore/page.tsx"), // This is the default route which will be the explore page
	]),

	...prefix("auth", [
		index("./routes/auth/page.login.tsx"), // This is the default route which will be the login page
		route("onboard", "./routes/auth/page.onboard.tsx"),
		route("forgot-password", "./routes/auth/page.forgot-password.tsx"),
		route("two-factor", "./routes/auth/page.two-factor.tsx"),
		route("verify-email", "./routes/auth/verifications/page.verify-email.tsx"),
		route("verify-delete", "./routes/auth/verifications/page.verify-delete-account.tsx"),
	]),

	...prefix("settings", [
		layout("./routes/settings/_layout.tsx", [
			index("./routes/settings/account/page.tsx", { id: "index-settings" }), // This is the default route which will be the account page
			route("account", "./routes/settings/account/page.tsx"),
			route("profile", "./routes/settings/profile/page.tsx"),
			route("security", "./routes/settings/security/page.tsx"),
		]),
	]),

	...prefix("users", [route(":username", "./routes/users/page.$user.tsx")]),
	...prefix("post", [
		route(":postId", "./routes/post/page.$post.tsx"),
		route(":postId/edit", "./routes/post/page.$post.edit.tsx"),
		route("new", "./routes/post/page.create.tsx"),
	]),

	// Static routes
	route("legal", "routes/static/legal.tsx"), // This is the legal page which is a static page, so it doesn't need a layout and it pre renders the content at build time
] satisfies RouteConfig;
