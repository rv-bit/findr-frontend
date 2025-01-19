import { createAuthClient } from "better-auth/react"
import { twoFactorClient, usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_RAILWAY_PUBLIC_API_URL,
    plugins: [
        twoFactorClient(),
        usernameClient()
    ]
})