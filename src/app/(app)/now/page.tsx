import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NowClient, type ConcernChoice } from "./now-client";

export default async function NowPage({
  searchParams,
}: {
  searchParams: Promise<{ concern?: string }>;
}) {
  const { concern } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [concerns, profile] = await Promise.all([
    prisma.concern.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const toChoice = (c: (typeof concerns)[number]): ConcernChoice => ({
    slug: c.slug,
    name: c.name,
    stateLabel: c.stateLabel,
    scale: c.scale,
  });

  const preset = concern && concerns.some((c) => c.slug === concern) ? concern : undefined;

  return (
    <NowClient
      physical={concerns.filter((c) => c.kind === "PHYSICAL").map(toChoice)}
      mental={concerns.filter((c) => c.kind === "MENTAL").map(toChoice)}
      defaultMinutes={profile?.timeAvailableMinutes ?? 5}
      presetSlug={preset}
    />
  );
}
