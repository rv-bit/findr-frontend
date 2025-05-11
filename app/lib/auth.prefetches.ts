import { createAuthPrefetches } from "@daveyplate/better-auth-tanstack";
import { authClient } from "./auth";

export const { prefetchSession } = createAuthPrefetches(authClient);
