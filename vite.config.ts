import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vite";

const devConfig = {
	server: {
		port: 3000,
		cors: true,
		proxy: {
			"/api": {
				// api version
				target: "http://localhost:5001",
				changeOrigin: true,
				secure: false,
				ws: true,
				rewrite: (path: string) => path.replace(/^\/api/, ""),
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
				changeOrigin: true,
				secure: true,
				rewrite: (path: string) => path.replace(/^\/api/, ""),
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
	plugins: [
		reactRouter(),
		tsconfigPaths(),
		babel({
			filter: /\.[jt]sx?$/,
			babelConfig: {
				presets: ["@babel/preset-typescript"], // if you use TypeScript
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		// @ts-ignore
		tailwindcss(),
	],

	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},

	...config,
});
