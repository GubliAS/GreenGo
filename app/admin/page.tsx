import type { Metadata } from "next";
import Link from "next/link";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle, Card, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SegmentedBar } from "@/components/ui/SegmentedBar";

/* Fleet overview → /admin · source: GreenGo Admin Fleet Overview.dc.html
 * Spec: handoff/admin.md §1. Copy verbatim. */

export const metadata: Metadata = { title: "Fleet overview — GreenGo Admin" };

const COUNTS = [
  { value: "1", label: "Total devices", tone: "text-canopy" },
  { value: "1", label: "Online", tone: "text-leaf" },
  { value: "0", label: "Offline", tone: "text-faint" },
  { value: "0", label: "Never reported", tone: "text-faint" },
  { value: "1", label: "Unclaimed", tone: "text-warn-text" },
  { value: "0", label: "Alerting now", tone: "text-faint" },
];

const ACTIVITY: { dot: string; actor: string; text: string; time: string }[] = [
  {
    dot: "bg-leaf",
    actor: "Kwame Asante",
    text: 'claimed device GG-4F82-K1 as "Greenhouse 1"',
    time: "2 months ago · 09:14 GMT",
  },
  {
    dot: "bg-canopy",
    actor: "Greenhouse 1",
    text: "pump command confirmed (AUTO, 4m 20s)",
    time: "Today · 06:14 GMT",
  },
  {
    dot: "bg-warn",
    actor: "Greenhouse 1",
    text: "soil alert sent — 24% (below 30% threshold)",
    time: "Yesterday · 21:02 GMT",
  },
  {
    dot: "bg-danger",
    actor: "Unknown",
    text: "failed login attempt for +233 24 XXX XX01",
    time: "3 days ago · 14:47 GMT",
  },
];

export default function AdminFleetPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="fleet" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-5.5">
        <PageTitle>Fleet overview</PageTitle>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
          {COUNTS.map((c) => (
            <StatCard key={c.label} value={c.value} label={c.label} valueClassName={c.tone} />
          ))}
        </div>

        <div className="bg-canopy rounded-card flex flex-wrap items-center justify-between gap-6 p-6">
          <div>
            <div className="font-mono text-micro tracking-caps mb-2 uppercase text-white/60">
              Greenhouse 1 · live from the fleet
            </div>
            <div className="flex items-baseline gap-2.5">
              <div className="font-mono text-36 font-semibold text-white">38%</div>
              <div className="text-sm text-white/75">soil moisture · updated 8s ago</div>
            </div>
          </div>
          <div className="max-w-105 min-w-55 flex-1">
            <SegmentedBar percent={38} count={24} height={32} surface="dark" radius="sm" />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <Card>
            <CardTitle>Recent activity</CardTitle>
            <div className="mt-4 flex flex-col gap-3.5">
              {ACTIVITY.map((a) => (
                <div key={a.text} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="text-body text-canopy">
                      <strong>{a.actor}</strong> {a.text}
                    </div>
                    <div className="text-label text-muted mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/admin/commands"
              className="text-meta text-leaf mt-4 inline-block font-semibold"
            >
              View all commands →
            </Link>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>SMS spend</CardTitle>
              <div className="mt-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Today</span>
                  <span className="font-mono text-lg text-canopy font-semibold">
                    GHS 0.60
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">This month</span>
                  <span className="font-mono text-lg text-canopy font-semibold">
                    GHS 8.40
                  </span>
                </div>
              </div>
              <Link href="/admin/sms" className="text-meta text-leaf mt-3.5 inline-block font-semibold">
                View SMS log →
              </Link>
            </Card>
            <div className="bg-mint rounded-card p-6">
              <div className="text-body text-canopy mb-2 font-semibold">
                Fleet is small on purpose
              </div>
              <div className="text-meta text-ink leading-body">
                One claimed device, one unclaimed unit awaiting provisioning.
                Every number above is exact, not a placeholder.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
