import type { Config } from "@react-router/dev/config";

export default {
	// Config options...
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: true,

	// Use this to pre render any routes at build time
	async prerender() {
		return ["/legal"];
	},
} satisfies Config;
