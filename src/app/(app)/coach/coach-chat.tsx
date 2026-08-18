"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronRight, Play, Send } from "lucide-react";
import { sendCoachMessage, startSuggestedSession } from "@/app/actions/coach";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  suggestion: { concernSlug: string; durationMinutes: number } | null;
};

const SUGGESTED_PROMPTS = [
  "My shoulders feel worse today",
  "I'm stressed and can't switch off",
  "I can't focus this afternoon",
];

export function CoachChat({
  initialMessages,
  userFirstName,
  concernNames,
}: {
  initialMessages: ChatMessage[];
  userFirstName: string | null;
  /** slug -> display name, so a suggestion chip can label itself. */
  concernNames: Record<string, string>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "seed",
            role: "ASSISTANT",
            text: `Good ${new Date().getHours() < 18 ? "day" : "evening"}${
              userFirstName ? `, ${userFirstName}` : ""
            }. How are you feeling right now?`,
            suggestion: null,
          },
        ]
  );
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const nextLocalId = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function send(text: string) {
    if (!text.trim() || isPending) return;
    const userMessage: ChatMessage = {
      id: `local-${nextLocalId.current++}`,
      role: "USER",
      text,
      suggestion: null,
    };
    setMessages((m) => [...m, userMessage]);
    setInput("");

    startTransition(async () => {
      const reply = await sendCoachMessage(text);
      setMessages((m) => [
        ...m,
        {
          id: `local-${nextLocalId.current++}`,
          role: "ASSISTANT",
          text: reply.text,
          suggestion: reply.suggestion,
        },
      ]);
    });
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="border-b border-mist bg-card px-5 py-4">
        <h1 className="font-display text-xl">AI Coach</h1>
        <p className="text-xs text-ink-soft/80">
          Tell it how you&apos;re feeling — body or head — and it&apos;ll suggest a routine.
        </p>
      </div>

      <div className="flex grow flex-col gap-3 overflow-y-auto px-5 py-5">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "ASSISTANT" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "ASSISTANT" ? "bg-card text-ink" : "bg-moss text-white"
              }`}
            >
              {m.text}
              {m.suggestion && (
                <button
                  onClick={() =>
                    startTransition(() => {
                      startSuggestedSession(m.suggestion!.concernSlug, m.suggestion!.durationMinutes);
                    })
                  }
                  disabled={isPending}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-mist bg-paper px-3 py-2.5 text-xs font-medium text-moss-deep disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5">
                    <Play size={12} fill="currentColor" /> Start{" "}
                    {concernNames[m.suggestion.concernSlug] ?? m.suggestion.concernSlug} ·{" "}
                    {m.suggestion.durationMinutes} min
                  </span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-card px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/60"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-mist bg-card px-3 py-1.5 text-xs text-ink-soft"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-mist bg-card px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Tell your coach how you feel..."
          className="grow rounded-full border border-mist bg-paper px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
        <button
          onClick={() => send(input)}
          disabled={isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-white disabled:opacity-60"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
