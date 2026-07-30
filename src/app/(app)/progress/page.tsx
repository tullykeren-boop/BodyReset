import { redirect } from "next/navigation";
import { Flame, Activity, Clock, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProgressStats } from "@/lib/progress-stats";
import { BodyMap } from "@/components/body-map";
import { Sparkline } from "@/components/sparkline";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getProgressStats(user.id);
  const topArea = stats.painAreaFrequency[0];

  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="font-display text-2xl">Your progress</h1>
      <p className="mt-1 text-sm text-ink-soft">Last 3 weeks</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {(
          [
            { value: stats.streak, label: "Day streak", Icon: Flame },
            { value: stats.totalSessions, label: "Sessions", Icon: Activity },
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

      <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">
          {topArea ? `${topArea.name} discomfort trend` : "Discomfort trend"}
        </p>
        {stats.improvementPct !== null ? (
          <>
            <p className="font-display mt-1 text-2xl">
              {stats.improvementPct >= 0 ? "Improved" : "Up"} {Math.abs(stats.improvementPct)}%
            </p>
            <p className="text-xs text-ink-soft/80">over the last 3 weeks</p>
            <Sparkline data={stats.discomfortTrend} width={280} height={80} />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft/80">
            Complete a few sessions and check-ins to start seeing your trend here.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">Most common pain areas</p>
        {stats.painAreaFrequency.length > 0 ? (
          <>
            <div className="mt-4 flex justify-center">
              <BodyMap
                selected={[]}
                size={90}
                interactive={false}
                heat={Object.fromEntries(stats.painAreaFrequency.map((p) => [p.slug, p.pct]))}
              />
            </div>
            <div className="mt-4 space-y-2.5">
              {stats.painAreaFrequency.map((p) => (
                <div key={p.slug}>
                  <div className="flex justify-between text-xs text-ink-soft">
                    <span>{p.name}</span>
                    <span className="font-mono">{p.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-paper">
                    <div className="h-1.5 rounded-full bg-clay" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft/80">
            Once you complete a few sessions, we&apos;ll show which areas come up most often.
          </p>
        )}
      </div>
    </div>
  );
}
