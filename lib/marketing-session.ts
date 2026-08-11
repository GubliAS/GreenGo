import { getSession } from "@/lib/session";

/** True when the visitor has a tenant session cookie (marketing nav CTA). */
export async function isTenantLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return session?.kind === "tenant";
}
