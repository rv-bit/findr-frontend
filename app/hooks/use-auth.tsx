import { createAuthHooks } from "@daveyplate/better-auth-tanstack";
import { authClient } from "~/lib/auth";

export const { useSession, usePrefetchSession, useListAccounts, useListSessions, useRevokeOtherSessions, useRevokeSession, useRevokeSessions } = createAuthHooks(authClient);
