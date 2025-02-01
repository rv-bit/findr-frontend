import { emailOTPClient, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "https://api.findr.blog/auth/",
	plugins: [twoFactorClient(), usernameClient(), emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
