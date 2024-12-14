import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

import { defineConfig } from "vite";

// Using any is BAD, but it's only for development
const devConfig = {
	server: {
		port: 3000,
		cors: true,
		proxy: {
			"/api": {
				target: "http://localhost:5001",
				changeOrigin: true,
				secure: false,
				ws: true,
				configure: (proxy: any, _options: any) => {
					proxy.on("error", (err: any, _req: any, _res: any) => {
						console.log("proxy error", err);
					});
					proxy.on("proxyReq", (proxyReq: any, req: any, _res: any) => {
						console.log("Sending Request to the Target:", req.method, req.url);
					});
					proxy.on("proxyRes", (proxyRes: any, req: any, _res: any) => {
						console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
					});
				},
			},
		},
	},
};

const config = process.env.DEV === "production" ? devConfig : {};

export default defineConfig({
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
	plugins: [reactRouter(), tsconfigPaths()],

	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},

	...config,
});
