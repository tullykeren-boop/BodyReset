import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TargetAreaIcon } from "@/components/target-area-icon";

export default async function TargetAreaPage() {
  const targetAreas = await prisma.targetArea.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Where does it hurt?</h1>
        <p className="mt-2 text-neutral-500">Pick the area you want to focus on today.</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {targetAreas.map((area) => (
          <Link
            key={area.id}
            href={`/intake/${area.slug}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 p-6 text-center transition hover:border-teal-500 hover:bg-teal-50 dark:border-neutral-800 dark:hover:border-teal-600 dark:hover:bg-teal-950/40"
          >
            <TargetAreaIcon slug={area.slug} className="text-3xl" />
            <p className="font-medium">{area.name}</p>
            <p className="text-xs text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
              {area.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
