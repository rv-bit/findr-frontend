import { createAuthHooks } from "@daveyplate/better-auth-tanstack";
import { authClient } from "~/lib/auth";

export const { useSession } = createAuthHooks(authClient);
