"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateCoachReply } from "@/lib/coach";
import { createAdHocSession } from "@/lib/adhoc-session";

export async function sendCoachMessage(text: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message can't be empty");

  const history = await prisma.coachMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  await prisma.coachMessage.create({
    data: { userId: user.id, role: "USER", content: trimmed },
  });

  const reply = await generateCoachReply(
    user.id,
    history.map((m) => ({ role: m.role, content: m.content })),
    trimmed
  );

  await prisma.coachMessage.create({
    data: {
      userId: user.id,
      role: "ASSISTANT",
      content: reply.text,
      suggestedConcernSlug: reply.suggestion?.concernSlug,
      suggestedDurationMinutes: reply.suggestion?.durationMinutes,
    },
  });

  return reply;
}

export async function startSuggestedSession(concernSlug: string, durationMinutes: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const session = await createAdHocSession(user.id, { concernSlug, durationMinutes });
  redirect(`/session/${session.id}`);
}
