import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { reactRouterDevTools } from "react-router-devtools";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vite";

const devConfig = {
	server: {
		port: 3000,
		cors: true,
	},

	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},
};

const prodConfig = {
	resolve: {
		alias: {
			"react-dom/server": "react-dom/server.node",
			"~": path.resolve(__dirname, "./app"),
		},
	},
};

const config = process.env.NODE_ENV === "development" ? devConfig : prodConfig;

export default defineConfig({
	plugins: [
		reactRouterDevTools(),
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

	...config,
});
