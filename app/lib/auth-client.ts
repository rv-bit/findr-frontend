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

export type Account = {
	id: string;
	provider: string;
	createdAt: Date;
	updatedAt: Date;
	accountId: string;
	scopes: string[];
};

export type Sessions = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string | null | undefined | undefined;
	userAgent?: string | null | undefined | undefined;
};

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
