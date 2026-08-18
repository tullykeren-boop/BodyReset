import { ShieldCheck } from "lucide-react";
import { Tag } from "@/components/tag";
import { Sparkline } from "@/components/sparkline";

const TEAM_STATS: [string, string][] = [
  ["84%", "Employee participation"],
  ["+22%", "Engagement, this quarter"],
  ["312", "Sessions this week"],
  ["6", "Departments active"],
];

const TEAM_DEPARTMENTS = [
  { name: "Product", adoption: 82 },
  { name: "Engineering", adoption: 64 },
  { name: "Design", adoption: 91 },
  { name: "Customer Success", adoption: 73 },
  { name: "Marketing", adoption: 58 },
];

const ORG_TREND = [6.4, 6.1, 5.8, 5.6, 5.2, 5.0, 4.7];

export default function TeamPage() {
  return (
    <div className="min-h-full bg-paper px-5 pb-8 pt-6">
      <Tag tone="sand">Future B2B · Preview</Tag>
      <h1 className="font-display mt-2 text-2xl">Team wellbeing</h1>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/80">
        <ShieldCheck size={13} /> Aggregate and anonymized only — individual health data is never shown.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {TEAM_STATS.map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-mist bg-card p-4">
            <p className="font-display text-xl">{n}</p>
            <p className="mt-1 text-[11px] text-ink-soft/80">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">Adoption by department</p>
        <div className="mt-4 space-y-3">
          {TEAM_DEPARTMENTS.map((d) => (
            <div key={d.name}>
              <div className="flex justify-between text-xs text-ink-soft">
                <span>{d.name}</span>
                <span className="font-mono">{d.adoption}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-paper">
                <div className="h-1.5 rounded-full bg-moss" style={{ width: `${d.adoption}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-mist bg-card p-5">
        <p className="text-sm font-medium">Anonymous wellbeing trend</p>
        <p className="text-xs text-ink-soft/80">Org-wide average discomfort rating</p>
        <Sparkline data={ORG_TREND} width={280} height={70} />
      </div>

      <p className="mt-6 text-center text-xs text-ink-soft/70">
        Interested in LetReSet for your organization?{" "}
        <a href="mailto:teams@resetapp.com" className="font-medium text-moss-deep hover:underline">
          Get in touch
        </a>
        .
      </p>
    </div>
  );
}
