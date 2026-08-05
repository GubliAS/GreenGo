import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  await clearSessionCookie();

  if (session) {
    await db.auditEntry.create({
      data: {
        actorUserId: session.userId,
        actorName: session.name,
        tenantId: session.kind === "tenant" ? session.tenantId : null,
        action: "LOGOUT",
        details: session.kind === "tenant" ? "Tenant logout" : "Admin logout",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
