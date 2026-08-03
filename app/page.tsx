import Link from "next/link";

/* Placeholder. This route becomes the Landing page in Phase 2A —
 * see MANIFEST.md §A.1 row 1 (GreenGo Landing Page.dc.html → /). */

export default function Home() {
  return (
    <main className="bg-app p-page flex min-h-screen items-center justify-center">
      <div className="border-hair border-hairline rounded-card max-w-auth bg-white p-6.5">
        <div className="font-display text-24 text-canopy tracking-tighter font-extrabold">
          Green<span className="text-leaf">Go</span>
        </div>
        <p className="text-md text-muted leading-body mt-2">
          Phase 1 complete — tokens and shared components are in place. The Landing
          page lands here in Phase 2A.
        </p>
        <Link
          href="/dev/tokens"
          className="text-md text-leaf mt-4 inline-block font-semibold"
        >
          View /dev/tokens →
        </Link>
      </div>
    </main>
  );
}
