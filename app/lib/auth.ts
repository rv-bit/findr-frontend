import { adminClient, emailOTPClient, multiSessionClient, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	plugins: [twoFactorClient(), usernameClient(), emailOTPClient(), adminClient(), multiSessionClient()],
});

export type Session = typeof authClient.$Infer.Session;
