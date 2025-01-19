import { createAuthClient } from "better-auth/react"
import { twoFactorClient, usernameClient } from "better-auth/client/plugins"

console.log(import.meta.env.DEV)
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_RAILWAY_PUBLIC_API_URL)    

const baseURL = import.meta.env.DEV ? import.meta.env.VITE_API_URL + "/api/auth/" : import.meta.env.VITE_RAILWAY_PUBLIC_API_URL + "/api/auth/";
export const authClient = createAuthClient({
    baseURL: baseURL,
    plugins: [
        twoFactorClient(),
        usernameClient()
    ]
})