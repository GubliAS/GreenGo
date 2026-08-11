import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { looksLikeCuid } from "@/lib/slug";

/* Resolve /devices/[slug] and /admin/devices/[slug]. Prefer slug; if the
 * param looks like a legacy cuid, permanently redirect to the slug URL. */

export async function resolveTenantDevice(slugOrId: string, tenantId: string) {
  const bySlug = await db.device.findFirst({
    where: { slug: slugOrId, tenantId },
  });
  if (bySlug) return bySlug;

  if (looksLikeCuid(slugOrId)) {
    const byId = await db.device.findFirst({
      where: { id: slugOrId, tenantId },
    });
    if (byId) redirect(`/devices/${byId.slug}`);
  }

  notFound();
}

export async function resolveAdminDevice(slugOrId: string) {
  const bySlug = await db.device.findFirst({
    where: { slug: slugOrId },
  });
  if (bySlug) return bySlug;

  if (looksLikeCuid(slugOrId)) {
    const byId = await db.device.findFirst({
      where: { id: slugOrId },
    });
    if (byId) redirect(`/admin/devices/${byId.slug}`);
  }

  notFound();
}

export async function resolveTenantDeviceForSubpath(
  slugOrId: string,
  tenantId: string,
  subpath: string,
) {
  const bySlug = await db.device.findFirst({
    where: { slug: slugOrId, tenantId },
  });
  if (bySlug) return bySlug;

  if (looksLikeCuid(slugOrId)) {
    const byId = await db.device.findFirst({
      where: { id: slugOrId, tenantId },
    });
    if (byId) redirect(`/devices/${byId.slug}/${subpath}`);
  }

  notFound();
}
