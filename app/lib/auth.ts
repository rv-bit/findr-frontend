import { adminClient, emailOTPClient, inferAdditionalFields, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_AUTH_API_URL,
	plugins: [
		inferAdditionalFields({
			user: {
				about_description: {
					type: "string",
				},
			},
		}),
		twoFactorClient(),
		usernameClient(),
		emailOTPClient(),
		adminClient(),
	],
});

export type Session = typeof authClient.$Infer.Session;
