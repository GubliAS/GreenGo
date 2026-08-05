import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyLoginDelay, resetLoginAttempts, verifyPasswordConstantPath } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

/* POST /api/auth/admin-login — admin/support sign-in. Identifier is email,
 * not phone: admins aren't tenants (see handoff/auth.md §4 / DEV-005). Same
 * no-enumeration + progressive-delay treatment as the tenant login route. */

const GENERIC_ERROR = "Incorrect email or password.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  await applyLoginDelay(email);

  const user = await db.user.findFirst({
    where: { email, role: { in: ["SUPPORT", "SUPER_ADMIN"] } },
  });

  const valid = await verifyPasswordConstantPath(user?.passwordHash ?? null, password);

  await db.auditEntry.create({
    data: {
      actorUserId: user?.id ?? null,
      actorName: user?.name ?? "Unknown",
      action: valid ? "LOGIN_SUCCESS" : "LOGIN_FAILURE",
      details: valid ? "Admin login" : `Failed admin login attempt for ${email}`,
    },
  });

  if (!valid || !user) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
  }

  await resetLoginAttempts(email);
  await setSessionCookie({
    kind: "admin",
    userId: user.id,
    role: user.role as "SUPPORT" | "SUPER_ADMIN",
    name: user.name,
  });

  return NextResponse.json({ ok: true });
}
