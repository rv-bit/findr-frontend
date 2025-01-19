import { createAuthClient } from "better-auth/react"
import { twoFactorClient, usernameClient } from "better-auth/client/plugins"

console.log(import.meta.env.MODE)
console.log(import.meta.env.VITE_API_URL)    

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL,
    plugins: [
        twoFactorClient(),
        usernameClient()
    ]
})