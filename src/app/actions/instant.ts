"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRoutineSession } from "@/lib/adhoc-session";
import { canStartSession } from "@/lib/billing";

const instantSchema = z.object({
  concernSlugs: z.array(z.string()).min(1, "Pick how you're feeling"),
  intensity: z.coerce.number().min(0).max(10),
  minutes: z.coerce.number().min(1).max(15),
  /** "I'm in a meeting" — forces discreet, seated, low-exertion practices. */
  discreet: z.boolean().default(false),
});

export type InstantRoutineInput = z.infer<typeof instantSchema>;

export type InstantRoutineState = { error: string } | undefined;

export async function buildInstantRoutine(
  input: InstantRoutineInput
): Promise<InstantRoutineState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = instantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }
  const { concernSlugs, intensity, minutes, discreet } = parsed.data;

  // The free-tier gate also has to run here. The session page checks it too,
  // but only for fresh starts -- without this check an instant routine would
  // be created before the user ever hits that gate.
  const check = await canStartSession(user.id, user.subscription);
  if (!check.allowed) redirect("/billing");

  const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } } });
  if (concerns.length === 0) return { error: "We couldn't find that concern" };

  // Preserve the order tapped: the first pick leads the routine.
  const orderedIds = concernSlugs
    .map((slug) => concerns.find((c) => c.slug === slug)?.id)
    .filter((id) => id !== undefined);

  const stateLog = await prisma.stateLog.create({
    data: {
      userId: user.id,
      source: "INSTANT",
      intensity,
      minutesAvailable: minutes,
      posture: discreet ? "SEATED" : null,
      discreetRequired: discreet,
      concerns: { create: orderedIds.map((concernId, rank) => ({ concernId, rank })) },
    },
  });

  try {
    const session = await createRoutineSession(user.id, {
      concernIds: orderedIds,
      minutes,
      origin: "INSTANT",
      stateLogId: stateLog.id,
      posture: discreet ? "SEATED" : undefined,
      discreetOnly: discreet,
      maxExertion: discreet ? 2 : undefined,
    });
    redirect(`/session/${session.id}`);
  } catch (err) {
    // redirect() throws by design; only real failures should surface as errors.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    if (typeof err === "object" && err !== null && "digest" in err) throw err;
    return { error: "We couldn't build a routine for that combination. Try a longer duration." };
  }
}
