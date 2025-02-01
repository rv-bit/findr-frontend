import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import path from "path";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vite";

const devConfig = {
	server: {
		port: 3000,
		cors: true,
		proxy: {
			"/api": {
				// api version
				target: "http://localhost:5001/",
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

const prodConfig = {
	server: {
		proxy: {
			"/api": {
				// api version
				target: process.env.VITE_API_URL,
				secure: true,
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

const config = process.env.NODE_ENV === "development" ? devConfig : prodConfig;

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
