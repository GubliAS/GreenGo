import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* GET /api/auth/claim-code?code=GG-XXXX-XX
 * Replaces the Login/Add Device pages' hardcoded CODE_MAP with a real
 * lookup. Returns one of the four states the ClaimCodeField component
 * already renders — no new UI states introduced, just a real data source. */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ status: null });
  }

  const claimCode = await db.claimCode.findUnique({ where: { code } });

  if (!claimCode) {
    return NextResponse.json({ status: "invalid" });
  }
  if (claimCode.consumedAt) {
    return NextResponse.json({ status: "claimed" });
  }
  if (claimCode.expiresAt && claimCode.expiresAt < new Date()) {
    return NextResponse.json({ status: "expired" });
  }
  return NextResponse.json({ status: "valid" });
}
