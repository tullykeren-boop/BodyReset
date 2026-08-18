import { redirect } from "next/navigation";
import { Flame, Activity, Clock, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProgressStats, type ConcernFrequency } from "@/lib/progress-stats";
import { BodyMap } from "@/components/body-map";
import { Sparkline } from "@/components/sparkline";
import { MENTAL_CONCERN_META } from "@/lib/concerns";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getProgressStats(user.id);

  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="font-display text-2xl">Your progress</h1>
      <p className="mt-1 text-sm text-ink-soft">Last 3 weeks</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {(
          [
            { value: stats.streak, label: "Day streak", Icon: Flame },
            { value: stats.totalSessions, label: "Routines", Icon: Activity },
            { value: stats.totalMinutes, label: "Minutes", Icon: Clock },
          ] satisfies { value: number; label: string; Icon: LucideIcon }[]
        ).map(({ value, label, Icon }) => (
          <div key={label} className="rounded-2xl border border-mist bg-card p-4 text-center">
            <Icon size={16} className="mx-auto text-moss" />
            <p className="font-display mt-2 text-xl">{value}</p>
            <p className="text-[10px] text-ink-soft/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Body vs. mind split, so neither half of the product hides inside a
          single blended number. */}
      {stats.totalSessions > 0 && (
        <div className="mt-4 flex gap-3">
          <SplitTile label="Body" value={stats.physicalSessions} tone="clay" />
          <SplitTile label="Mind" value={stats.mentalSessions} tone="moss" />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">How you&apos;ve been feeling</p>
        {stats.improvementPct !== null ? (
          <>
            <p className="font-display mt-1 text-2xl">
              {stats.improvementPct >= 0 ? "Improved" : "Up"} {Math.abs(stats.improvementPct)}%
            </p>
            <p className="text-xs text-ink-soft/80">
              across everything you track, over the last 3 weeks
            </p>
            <Sparkline data={stats.burdenTrend} width={280} height={80} />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft/80">
            Complete a few routines and check-ins to start seeing your trend here.
          </p>
        )}
        {stats.avgRelief !== null && (
          <p className="mt-3 text-xs text-ink-soft/80">
            Your routines shift how you feel by an average of{" "}
            <span className="font-mono text-moss-deep">{stats.avgRelief.toFixed(1)}</span> points.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">Where it shows up in your body</p>
        {stats.physicalConcernFrequency.length > 0 ? (
          <>
            <div className="mt-4 flex justify-center">
              <BodyMap
                selected={[]}
                size={90}
                interactive={false}
                heat={Object.fromEntries(
                  stats.physicalConcernFrequency.map((p) => [p.slug, p.pct])
                )}
              />
            </div>
            <FrequencyBars rows={stats.physicalConcernFrequency} tone="clay" />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft/80">
            Once you complete a few body routines, we&apos;ll show which areas come up most.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">What&apos;s been on your mind</p>
        {stats.mentalConcernFrequency.length > 0 ? (
          <>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {stats.mentalConcernFrequency.slice(0, 4).map((c) => {
                const Icon = MENTAL_CONCERN_META[c.slug]?.icon;
                return (
                  <span
                    key={c.slug}
                    className="flex items-center gap-1.5 rounded-full border border-mist bg-paper px-3 py-1.5 text-xs text-ink-soft"
                  >
                    {Icon && <Icon size={13} className="text-moss" />}
                    {c.name}
                  </span>
                );
              })}
            </div>
            <FrequencyBars rows={stats.mentalConcernFrequency} tone="moss" />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft/80">
            Once you complete a few mind routines, we&apos;ll show what comes up most.
          </p>
        )}
      </div>
    </div>
  );
}

function SplitTile({ label, value, tone }: { label: string; value: number; tone: "clay" | "moss" }) {
  return (
    <div className="grow rounded-2xl border border-mist bg-card p-4">
      <p className="text-xs text-ink-soft/80">{label}</p>
      <p className={`font-display mt-1 text-xl ${tone === "clay" ? "text-clay" : "text-moss-deep"}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-soft/70">routines</p>
    </div>
  );
}

function FrequencyBars({ rows, tone }: { rows: ConcernFrequency[]; tone: "clay" | "moss" }) {
  return (
    <div className="mt-4 space-y-2.5">
      {rows.map((row) => (
        <div key={row.slug}>
          <div className="flex justify-between text-xs text-ink-soft">
            <span>{row.name}</span>
            <span className="font-mono">{row.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-paper">
            <div
              className={`h-1.5 rounded-full ${tone === "clay" ? "bg-clay" : "bg-moss"}`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
