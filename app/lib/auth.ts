import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
	baseURL: import.meta.env.NODE_ENV === "development" ? import.meta.env.VITE_API_URL : import.meta.env.VITE_RAILWAY_PUBLIC_API_URL,
});
