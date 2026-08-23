"use client";

import { useState, useRef, useEffect } from "react";
import { whatsappLink } from "@/config/site";

/**
 * 100% free, fully client-side rule-based FAQ chatbot. No API, no LLM,
 * no ongoing cost, no human required — every reply is a preset string
 * picked from `faqEntries` below by keyword match. Add/edit entries
 * there to grow the bot's knowledge; no backend involved.
 *
 * Mounted once in `src/app/(site)/layout.tsx`, floats bottom-right.
 * Positioned to the left of `WhatsAppButton` (offset via `right`) so
 * the two floating widgets don't overlap.
 */

interface FaqEntry {
  keywords: string[];
  answer: string;
}

const faqEntries: FaqEntry[] = [
  {
    keywords: ["service", "services", "offer", "what do you do", "capabilities"],
    answer:
      "6STANZA works across Strategy, Software, Systems, Security, Scalability, and Speed — from product strategy and custom software to cloud infrastructure and security. Check out the Services page for the full breakdown.",
  },
  {
    keywords: ["project", "projects", "portfolio", "work", "case stud"],
    answer:
      "You can see our past and current work on the Projects page — it covers the systems we've designed and shipped for clients.",
  },
  {
    keywords: ["team", "who", "founder", "people"],
    answer: "Meet the people behind 6STANZA on the Team page.",
  },
  {
    keywords: ["about", "company", "mission", "who are you"],
    answer:
      "6STANZA is a technology partner for Strategy, Software, Systems, Security, Scalability, and Speed. More on our story is on the About page.",
  },
  {
    keywords: ["contact", "email", "phone", "reach", "get in touch", "talk"],
    answer:
      "The fastest way to reach us is WhatsApp — tap the green button in the corner, or visit the Contact page to send a message directly.",
  },
  {
    keywords: ["price", "pricing", "cost", "quote", "budget", "how much"],
    answer:
      "Pricing depends on project scope, so the best next step is starting a project brief — head to \"Start a Project\" and our team will follow up with a quote.",
  },
  {
    keywords: ["start", "hire", "begin", "kick off", "new project"],
    answer:
      "Great — use the \"Start a Project\" button in the header to tell us about what you need, and we'll take it from there.",
  },
  {
    keywords: ["insight", "blog", "article", "read"],
    answer: "Our Insights page has articles on strategy, engineering, and systems thinking.",
  },
  {
    keywords: ["hello", "hi", "hey", "assalam", "salam"],
    answer: "Hey! I'm the 6STANZA FAQ bot. Ask me about our services, projects, pricing, or how to get in touch.",
  },
  {
    keywords: ["human", "agent", "real person", "talk to someone"],
    answer:
      "For a real conversation with our team, tap the WhatsApp button in the corner — someone will get back to you directly.",
  },
];

const fallbackAnswer =
  "I don't have a preset answer for that yet — try asking about our services, projects, pricing, or how to get in touch. For anything else, WhatsApp our team directly.";

function findAnswer(input: string): string {
  const normalized = input.toLowerCase();
  for (const entry of faqEntries) {
    if (entry.keywords.some((k) => normalized.includes(k))) {
      return entry.answer;
    }
  }
  return fallbackAnswer;
}

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
}

export function FaqChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      from: "bot",
      text: "Hi! I'm the 6STANZA FAQ bot. Ask me about services, projects, pricing, or contact — I reply instantly, no waiting.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: Date.now(), from: "user", text: trimmed };
    const botMsg: ChatMessage = { id: Date.now() + 1, from: "bot", text: findAnswer(trimmed) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <>
      {open && (
        <div
          className="fixed flex flex-col rounded-2xl shadow-2xl"
          style={{
            bottom: "96px",
            right: "24px",
            width: "min(340px, calc(100vw - 32px))",
            height: "440px",
            background: "var(--stz-white, #ffffff)",
            border: "1px solid var(--color-border, #e5e5e5)",
            zIndex: "var(--z-overlay)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "var(--color-brand, #111)", color: "#ffffff" }}
          >
            <span className="font-medium" style={{ fontSize: "var(--text-small, 14px)" }}>
              6STANZA FAQ Bot
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="max-w-[85%] rounded-xl px-3 py-2 text-sm"
                style={
                  m.from === "bot"
                    ? { background: "#f2f2f2", color: "#111", alignSelf: "flex-start" }
                    : {
                        background: "var(--color-brand, #111)",
                        color: "#fff",
                        marginLeft: "auto",
                      }
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t px-3 py-3" style={{ borderColor: "var(--color-border, #e5e5e5)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--color-border, #e5e5e5)" }}
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              className="rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ background: "var(--color-brand, #111)" }}
            >
              Send
            </button>
          </div>

          <div className="px-4 pb-3 text-center">
            <a
              href={whatsappLink("Hi 6STANZA, I have a question the FAQ bot couldn't answer.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline opacity-70 hover:opacity-100"
            >
              Need a real person? Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close FAQ chat" : "Open FAQ chat"}
        className="fixed flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          bottom: "24px",
          right: "92px",
          width: "56px",
          height: "56px",
          background: "var(--color-brand, #111)",
          color: "#ffffff",
          zIndex: "var(--z-overlay)",
        }}
      >
        {open ? (
          <span style={{ fontSize: "24px" }}>✕</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z" />
          </svg>
        )}
      </button>
    </>
  );
}
