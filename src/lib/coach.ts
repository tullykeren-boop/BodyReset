import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { getAnthropicClient, isAnthropicConfigured, COACH_MODEL } from "@/lib/anthropic";
import { relief } from "@/lib/intensity";
import type { CoachRole, Goal, ConcernKind } from "@/generated/prisma/client";
import type Anthropic from "@anthropic-ai/sdk";

export type CoachContext = {
  name: string | null;
  goal: Goal;
  concerns: { slug: string; name: string; kind: ConcernKind }[];
  /** Every concern the catalog covers, so the model can only suggest real ones. */
  availableConcerns: { slug: string; name: string; kind: ConcernKind }[];
  streak: number;
  recentMoods: string[];
  recentFeedback: { helped: boolean; scale: string; change: number }[];
};

export type CoachReply = {
  text: string;
  /** `concernSlug` is a real Concern slug, so the handoff is an id lookup. */
  suggestion: { concernSlug: string; durationMinutes: number } | null;
};

async function getCoachContext(userId: string): Promise<CoachContext> {
  const [user, profile, allConcerns, recentCheckIns, recentFeedback, completedSessions] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({
        where: { userId },
        include: { concerns: { include: { concern: true }, orderBy: { rank: "asc" } } },
      }),
      prisma.concern.findMany({
        select: { slug: true, name: true, kind: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.checkIn.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 3 }),
      prisma.sessionFeedback.findMany({
        where: { plannedSession: { dailyPlan: { userId } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.plannedSession.findMany({
        where: { dailyPlan: { userId }, completedAt: { not: null } },
        select: { completedAt: true },
      }),
    ]);

  return {
    name: user?.name ?? null,
    goal: profile?.goal ?? "MOBILITY",
    concerns:
      profile?.concerns.map((c) => ({
        slug: c.concern.slug,
        name: c.concern.name,
        kind: c.concern.kind,
      })) ?? [],
    availableConcerns: allConcerns,
    streak: calculateStreak(completedSessions.map((s) => s.completedAt as Date)),
    recentMoods: recentCheckIns.map((c) => c.mood),
    recentFeedback: recentFeedback.map((f) => ({
      helped: f.helped,
      scale: f.scale.toLowerCase(),
      change: relief(f.scale, f.intensityBefore, f.intensityAfter),
    })),
  };
}

function buildSystemPrompt(context: CoachContext): string {
  const physical = context.concerns.filter((c) => c.kind === "PHYSICAL").map((c) => c.name);
  const mental = context.concerns.filter((c) => c.kind === "MENTAL").map((c) => c.name);

  const lines = [
    "You are the LetReSet coach: a calm, warm, concise movement and reset coach for desk workers.",
    "LetReSet offers short guided routines (30 seconds to 10 minutes) for both physical concerns (neck, shoulders, upper back, lower back, wrists, hips) and mental ones (stress, anxiety, focus, energy, mood, eye strain, restlessness). Treat both as equally real and equally worth addressing.",
    "You are NOT a doctor or a therapist. Never diagnose conditions, and never claim to know something about the user you were not told. Only reference facts given below — do not invent details about their calendar, meetings, or day.",
    "If someone describes a mental health crisis or severe persistent symptoms, gently encourage them to speak to a professional rather than offering a routine as a substitute.",
    "Keep replies to 2-4 short sentences, warm and specific, never generic filler.",
    "",
    "What you actually know about this user:",
    `- Primary goal: ${context.goal.replace(/_/g, " ").toLowerCase()}`,
    physical.length > 0
      ? `- Physical areas they flagged: ${physical.join(", ")}`
      : "- They haven't flagged any physical areas.",
    mental.length > 0
      ? `- Mental concerns they flagged: ${mental.join(", ")}`
      : "- They haven't flagged any mental concerns.",
    `- Current streak: ${context.streak} day(s)`,
    context.recentMoods.length > 0
      ? `- Recent check-ins (most recent first): ${context.recentMoods.join(", ")}`
      : "- No recent check-ins logged.",
    context.recentFeedback.length > 0
      ? `- Recent session feedback: ${context.recentFeedback
          .map(
            (f) =>
              `${f.scale} improved by ${f.change}${f.helped ? ", helped" : ", didn't help much"}`
          )
          .join("; ")}`
      : "- No session feedback yet.",
    "",
    "If — and only if — it's genuinely relevant, you may suggest one short routine. When you do, end your reply on its own new line with exactly this format (nothing else on that line):",
    '<<SUGGEST concern="stress" minutes="3">>',
    `The concern value must be exactly one of these slugs: ${context.availableConcerns
      .map((c) => c.slug)
      .join(", ")}.`,
    "Omit this line entirely if a suggestion doesn't fit the conversation.",
  ];
  return lines.join("\n");
}

const SUGGEST_LINE = /<<SUGGEST\s+concern="([^"]+)"\s+minutes="(\d+)">>\s*$/;

function parseSuggestion(text: string): CoachReply {
  const match = text.match(SUGGEST_LINE);
  if (!match) return { text: text.trim(), suggestion: null };
  return {
    text: text.replace(SUGGEST_LINE, "").trim(),
    suggestion: { concernSlug: match[1], durationMinutes: Number(match[2]) },
  };
}

const FALLBACK_RULES: {
  match: string[];
  reply: (ctx: CoachContext) => CoachReply;
}[] = [
  // --- Physical ---
  {
    match: ["shoulder"],
    reply: (ctx) => ({
      text: `Shoulders are a common spot for tension to build through the day${
        ctx.concerns.some((c) => c.slug === "shoulders") ? " — it's one of the areas you flagged" : ""
      }. A short shoulder release now can stop it from building further.`,
      suggestion: { concernSlug: "shoulders", durationMinutes: 4 },
    }),
  },
  {
    match: ["neck"],
    reply: () => ({
      text: "Neck tightness usually responds well to a short mobility reset before it builds through the afternoon. Want to try one now?",
      suggestion: { concernSlug: "neck", durationMinutes: 3 },
    }),
  },
  {
    match: ["back"],
    reply: () => ({
      text: "Lower back tightness often builds after long stretches of sitting. A quick standing reset can help reset your posture.",
      suggestion: { concernSlug: "lower-back", durationMinutes: 5 },
    }),
  },
  {
    match: ["wrist"],
    reply: () => ({
      text: "Wrist strain adds up fast with typing and mousing. A short stretch-and-mobilize break can take the edge off.",
      suggestion: { concernSlug: "wrists", durationMinutes: 3 },
    }),
  },
  {
    match: ["hip"],
    reply: () => ({
      text: "Tight hips are common after long sitting stretches. A short hip-opening session can help you feel more mobile.",
      suggestion: { concernSlug: "hips", durationMinutes: 4 },
    }),
  },
  // --- Mental ---
  {
    match: ["stress", "stressed", "overwhelm", "swamped", "under pressure"],
    reply: () => ({
      text: "When stress stacks up, the fastest lever is usually your breath — it's the one part of the stress response you can steer directly. A couple of minutes is genuinely enough to shift it.",
      suggestion: { concernSlug: "stress", durationMinutes: 3 },
    }),
  },
  {
    match: ["anxious", "anxiety", "panicky", "on edge", "racing"],
    reply: () => ({
      text: "A racing mind tends to settle faster when you give it something concrete to hold onto rather than trying to think your way calm. A short grounding routine can help.",
      suggestion: { concernSlug: "anxiety", durationMinutes: 3 },
    }),
  },
  {
    match: ["focus", "concentrate", "distracted", "foggy", "brain fog", "scattered"],
    reply: () => ({
      text: "Scattered attention is usually a sign you've been holding focus too long without a break, not that you're low on willpower. A short reset before your next block tends to work better than pushing through.",
      suggestion: { concernSlug: "low-focus", durationMinutes: 3 },
    }),
  },
  {
    match: ["tired", "energy", "exhausted", "fatigue", "drained", "sluggish", "slump"],
    reply: () => ({
      text: "That afternoon drop usually isn't about sleep alone — stagnant blood flow from sitting plays a big part. A short movement reset can help more than a coffee refill.",
      suggestion: { concernSlug: "low-energy", durationMinutes: 3 },
    }),
  },
  {
    match: ["eyes", "eye strain", "screen", "blurry"],
    reply: () => ({
      text: "Your eyes have been holding one focal distance for hours, and the muscles doing that get tired like any others. Looking far away for even twenty seconds helps.",
      suggestion: { concernSlug: "eye-strain", durationMinutes: 2 },
    }),
  },
  {
    match: ["restless", "fidget", "wired", "antsy", "can't sit"],
    reply: () => ({
      text: "That wired, can't-sit-still feeling usually wants to be moved through rather than suppressed. A short discharge routine tends to settle it faster than willpower.",
      suggestion: { concernSlug: "restlessness", durationMinutes: 2 },
    }),
  },
  {
    match: ["mood", "flat", "down", "low", "unmotivated", "meh"],
    reply: () => ({
      text: "A flat mood often responds to posture and movement before it responds to thinking about it. A short routine is a low-cost way to test that.",
      suggestion: { concernSlug: "low-mood", durationMinutes: 3 },
    }),
  },
];

function fallbackReply(userMessage: string, context: CoachContext): CoachReply {
  const lower = userMessage.toLowerCase();
  const rule = FALLBACK_RULES.find((r) => r.match.some((kw) => lower.includes(kw)));
  if (rule) return rule.reply(context);
  return {
    text:
      context.concerns.length > 0
        ? `Got it — noted. Based on what you've told us, a short ${context.concerns[0].name.toLowerCase()} routine could be a good next step whenever you have a few minutes.`
        : "Got it — noted. Let me know how you're feeling — physically or mentally — and I can point you to a short routine that might help.",
    suggestion: null,
  };
}

export async function generateCoachReply(
  userId: string,
  history: { role: CoachRole; content: string }[],
  userMessage: string
): Promise<CoachReply> {
  const context = await getCoachContext(userId);

  if (!isAnthropicConfigured()) {
    return fallbackReply(userMessage, context);
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 300,
      system: buildSystemPrompt(context),
      messages: [
        ...history.map((m) => ({
          role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const reply = parseSuggestion(text);
    // The model can still emit a slug that isn't real; drop the suggestion
    // rather than handing a dead slug to the routine builder.
    if (reply.suggestion) {
      const known = context.availableConcerns.some((c) => c.slug === reply.suggestion!.concernSlug);
      if (!known) return { text: reply.text, suggestion: null };
    }
    return reply;
  } catch {
    return fallbackReply(userMessage, context);
  }
}
