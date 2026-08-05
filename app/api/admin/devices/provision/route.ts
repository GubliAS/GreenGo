import { NextResponse } from "next/server";
import crypto from "node:crypto";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/* POST /api/admin/devices/provision — the admin-side counterpart to claim
 * redemption: generates a device row, a single-use claim code, and an API
 * key shown exactly once (never stored in plaintext, never retrievable
 * again — matching the handoff's "shown once" warning literally). */

function randomClaimCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I
  const part = (n: number) =>
    Array.from({ length: n }, () => alphabet[crypto.randomInt(alphabet.length)]).join("");
  return `GG-${part(4)}-${part(2)}`;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.kind !== "admin") {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const mac = typeof body?.mac === "string" ? body.mac.trim().toUpperCase() : null;
  const label = typeof body?.label === "string" ? body.label.trim() : null;

  if (!mac || !label) {
    return NextResponse.json({ ok: false, error: "MAC address and label are required." }, { status: 400 });
  }

  const existing = await db.device.findUnique({ where: { mac } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "A device with this MAC address already exists." }, { status: 409 });
  }

  const apiKeyPlaintext = `ggk_${crypto.randomBytes(16).toString("hex")}`;
  const apiKeyHash = await argon2.hash(apiKeyPlaintext, { type: argon2.argon2id });
  const claimCode = randomClaimCode();
  const now = new Date();

  const device = await db.device.create({
    data: { mac, label, apiKeyHash, firmware: "v1.4.2", createdAt: now },
  });
  await db.claimCode.create({
    data: { code: claimCode, deviceId: device.id, createdAt: now },
  });
  await db.auditEntry.create({
    data: {
      actorUserId: session.userId,
      actorName: session.name,
      deviceId: device.id,
      action: "DEVICE_PROVISIONED",
      details: `Claim code ${claimCode} generated for ${mac}`,
      createdAt: now,
    },
  });

  return NextResponse.json({
    ok: true,
    deviceId: device.id,
    claimCode,
    apiKey: apiKeyPlaintext,
  });
}
