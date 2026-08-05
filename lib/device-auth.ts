import argon2 from "argon2";
import { db } from "./db";
import type { Device } from "@prisma/client";

/* Device endpoints have their own auth regime, entirely separate from the
 * user session cookie: the ESP32 has no browser, so there is no session,
 * no cookie, nothing but a header on each request.
 *
 * Two headers identify + authenticate the device:
 *   X-Device-Mac      the immutable hardware identity (looked up, not trusted
 *                     as an authorization claim by itself)
 *   X-Device-Api-Key  the plaintext key, verified against the stored Argon2id
 *                     hash via argon2.verify — the hash can't be reversed
 *                     into a lookup key, so identifying the device first is
 *                     required before the key can be checked at all.
 */

export class DeviceAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeviceAuthError";
  }
}

export async function authenticateDevice(request: Request): Promise<Device> {
  const mac = request.headers.get("x-device-mac");
  const apiKey = request.headers.get("x-device-api-key");

  if (!mac || !apiKey) {
    throw new DeviceAuthError("Missing X-Device-Mac or X-Device-Api-Key header.");
  }

  const device = await db.device.findUnique({ where: { mac } });
  if (!device) {
    throw new DeviceAuthError("Unknown device.");
  }
  if (device.disabled) {
    throw new DeviceAuthError("Device is disabled.");
  }

  const valid = await argon2.verify(device.apiKeyHash, apiKey).catch(() => false);
  if (!valid) {
    throw new DeviceAuthError("Invalid API key.");
  }

  return device;
}
