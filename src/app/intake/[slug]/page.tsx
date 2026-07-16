import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IntakeForm } from "./intake-form";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const targetArea = await prisma.targetArea.findUnique({ where: { slug } });
  if (!targetArea) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
          {targetArea.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">A couple of quick questions</h1>
        <p className="mt-2 text-neutral-500">
          This helps us pick the right exercises for you today.
        </p>
      </div>
      <IntakeForm targetAreaSlug={targetArea.slug} />
    </div>
  );
}
