import { createAuthPrefetches } from "@daveyplate/better-auth-tanstack";
import { authClient } from "./auth-client";

export const { prefetchSession } = createAuthPrefetches(authClient);
