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
	},
};

const config = process.env.NODE_ENV === "development" ? devConfig : {};

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
