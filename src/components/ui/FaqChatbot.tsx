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
  /** Higher weight wins ties. Specific entries (a named service) should outrank generic ones ("services" overview). */
  weight: number;
  keywords: string[];
  answer: string;
}

/**
 * Knowledge base. Content mirrors the real static copy in
 * `src/features/home/data/services.ts` and `src/features/home/data/sixS.ts`
 * (the Six S philosophy) so the bot's answers match what's actually on
 * the site. Services are also CMS-editable in the live app - if you
 * rename/add services in the admin panel, update the matching entries
 * here too so the bot stays in sync.
 */
const faqEntries: FaqEntry[] = [
  {
    weight: 3,
    keywords: ["six s", "6 s", "6s", "philosophy", "principle", "strategy software systems"],
    answer:
      "6STANZA is built on six operating principles: Strategy (define the outcome before touching a tool), Software (code as a long-term asset), Systems (coherence at scale), Security (treated as architecture, not an afterthought), Scalability (designed for 18 months out), and Speed (fast pipelines, fast decisions). More detail is on the About page.",
  },
  {
    weight: 3,
    keywords: ["web dev", "website", "web app", "frontend", "front-end", "front end"],
    answer:
      "Web Development: engineered interfaces and applications built for performance, structured for growth, and shipped on infrastructure that holds up under real traffic. Covers frontend, APIs, and performance work.",
  },
  {
    weight: 3,
    keywords: ["cloud", "aws", "gcp", "azure"],
    answer:
      "Cloud Computing: architecture that scales with intention. We design cloud environments around cost, resilience, and how your systems actually grow - AWS/GCP, cost control, resilience.",
  },
  {
    weight: 3,
    keywords: ["devops", "ci/cd", "cicd", "pipeline", "infrastructure as code", "iac"],
    answer:
      "DevOps: continuous delivery pipelines, infrastructure as code, and observability - the discipline that turns shipping software into a repeatable system.",
  },
  {
    weight: 3,
    keywords: ["cyber security", "cybersecurity", "security service", "hacking", "threat"],
    answer:
      "Cyber Security: threat modeling, hardened infrastructure, and audited access - security treated as architecture, not bolted on at the end.",
  },
  {
    weight: 3,
    keywords: ["networking", "network service", "topology", "uptime"],
    answer:
      "Networking: the connective tissue behind every system we build - reliable, monitored, and designed to keep your infrastructure talking to itself correctly.",
  },
  {
    weight: 3,
    keywords: ["marketing", "advertising", "campaign", "positioning"],
    answer:
      "Marketing & Advertising: positioning and campaigns built with the same rigor as our engineering - data-informed, measured, built to compound over time.",
  },
  {
    weight: 3,
    keywords: ["video edit", "video production", "motion", "post-production", "post production"],
    answer:
      "Video Editing: production-grade edits for product, brand, and campaign - motion and pacing crafted to hold attention and communicate with precision.",
  },
  {
    weight: 3,
    keywords: ["seo", "search engine", "ranking", "google ranking"],
    answer:
      "SEO: technical and editorial SEO grounded in how systems actually get discovered - structure first, content second, tactics last.",
  },
  {
    weight: 1,
    keywords: ["service", "services", "offer", "what do you do", "capabilities", "what can you build"],
    answer:
      "6STANZA offers Web Development, Cloud Computing, DevOps, Cyber Security, Networking, Marketing & Advertising, Video Editing, and SEO. Ask me about any one of them, or check the Services page for full detail.",
  },
  {
    weight: 2,
    keywords: ["project", "projects", "portfolio", "work", "case stud", "past client", "examples"],
    answer:
      "You can see our past and current work on the Projects page - it covers the systems we've designed and shipped for clients, with detail on architecture and outcomes.",
  },
  {
    weight: 2,
    keywords: ["team", "who works", "founder", "engineers", "staff"],
    answer: "Meet the people behind 6STANZA on the Team page - it lists our engineers and their focus areas.",
  },
  {
    weight: 2,
    keywords: ["about", "company", "mission", "who are you", "who is 6stanza", "what is 6stanza"],
    answer:
      "6STANZA is a technology partner built around Strategy, Software, Systems, Security, Scalability, and Speed. We work with clients across engineering, infrastructure, and growth. More on our story is on the About page.",
  },
  {
    weight: 2,
    keywords: ["contact", "email", "phone", "reach", "get in touch", "talk to", "message"],
    answer:
      "The fastest way to reach us is WhatsApp - tap the green button in the corner, or visit the Contact page to send a message directly.",
  },
  {
    weight: 2,
    keywords: ["price", "pricing", "cost", "quote", "budget", "how much", "expensive", "cheap"],
    answer:
      "Pricing depends on project scope, so the best next step is starting a project brief - head to \"Start a Project\" in the header and our team will follow up with a quote.",
  },
  {
    weight: 2,
    keywords: ["start", "hire", "begin", "kick off", "new project", "work with you", "get started"],
    answer:
      "Use the \"Start a Project\" button in the header to tell us what you need, and our team will follow up.",
  },
  {
    weight: 2,
    keywords: ["insight", "blog", "article", "read", "resources", "content"],
    answer: "Our Insights page has articles on strategy, engineering, and systems thinking.",
  },
  {
    weight: 2,
    keywords: ["location", "based", "where are you", "office", "country", "based in"],
    answer:
      "6STANZA is a Pakistan-based technology partner working with clients globally. For anything location-specific, the Contact page or WhatsApp is the best way to ask directly.",
  },
  {
    weight: 2,
    keywords: ["how long", "timeline", "turnaround", "duration", "how fast"],
    answer:
      "Timelines depend entirely on project scope - a landing page and a full platform build take very different shapes. Share your project via \"Start a Project\" and we'll give you a real estimate.",
  },
  {
    weight: 1,
    keywords: ["hello", "hi", "hey", "assalam", "salam", "good morning", "good evening"],
    answer: "Hey! I'm the 6STANZA FAQ bot. Ask me about our services, projects, pricing, team, or how to get in touch.",
  },
  {
    weight: 1,
    keywords: ["thank", "thanks", "appreciate", "cool", "ok great", "awesome"],
    answer: "Anytime! Let me know if there's anything else you'd like to know about 6STANZA.",
  },
  {
    weight: 1,
    keywords: ["bye", "goodbye", "see you", "later"],
    answer: "Take care! If you need us again, this bot and the WhatsApp button are always here.",
  },
  {
    weight: 1,
    keywords: ["human", "agent", "real person", "talk to someone", "customer support", "support"],
    answer:
      "For a real conversation with our team, tap the WhatsApp button in the corner - someone will get back to you directly.",
  },
  {
    weight: 1,
    keywords: ["are you a bot", "are you human", "are you ai"],
    answer:
      "I'm 6STANZA's built-in FAQ bot - I answer instantly from a fixed set of topics about the company. For anything outside that, WhatsApp connects you to a real person.",
  },

  // --- Positioning / trust ---
  {
    weight: 2,
    keywords: ["trust", "trustworthy", "why choose", "why 6stanza", "reliable", "credible"],
    answer:
      "6STANZA is positioned as a technology partner, not just a web-development shop - the focus is on trustworthy, realistic commitments, clear communication, and dependable delivery, working within what we can actually deliver rather than overpromising.",
  },
  {
    weight: 2,
    keywords: ["technology partner", "not just", "web shop", "web dev shop"],
    answer:
      "6STANZA positions itself as a technology partner rather than a typical web-development agency - working across strategy, engineering, infrastructure, security, and growth as a connected practice, not one-off web builds.",
  },

  // --- Process (distinct from Six S) ---
  {
    weight: 3,
    keywords: ["process", "how do you work", "methodology", "discover design build", "how does a project start", "workflow"],
    answer:
      "Our process moves through six stages: Discover (understand the actual problem), Design (architecture and interface decisions before code), Build (disciplined, version-controlled engineering), Validate (testing, load, and security checks before launch), Deploy (shipped on infrastructure built for real traffic), and Evolve (we stay close to what we build after launch). This is distinct from the Six S philosophy, which describes how we think, not the delivery sequence.",
  },

  // --- Target customers ---
  {
    weight: 2,
    keywords: ["startup", "founder", "small business", "who do you work with", "who is this for", "enterprise", "large company"],
    answer:
      "6STANZA works with both startup/business founders - who need approachable, practical, solution-oriented support - and enterprise organizations, who need credible, structured, security-conscious, and scalable delivery. The approach adapts to the audience.",
  },

  // --- Business direction / locations (careful phrasing per positioning doc) ---
  {
    weight: 2,
    keywords: ["expand", "expansion", "saudi", "uae", "dubai", "international", "global"],
    answer:
      "6STANZA is based in Pakistan, with an ambition to expand toward Saudi Arabia and the UAE, and eventually broader international markets. I don't have confirmation of any offices currently open in those locations - for the latest, please check with the team directly via WhatsApp or Contact.",
  },

  // --- Technology stack (capability framing, not universal claims) ---
  {
    weight: 2,
    keywords: ["technology", "tech stack", "stack", "next.js", "nextjs", "react", "typescript", "node", "supabase", "postgres", "docker", "kubernetes", "terraform", "programming language"],
    answer:
      "6STANZA works with modern technology areas depending on project needs - things like Next.js, React, TypeScript, Node.js, PostgreSQL/Supabase, AWS, Docker, Kubernetes, and Terraform, among others. Not every project uses every technology - the stack is chosen based on what a given project actually requires.",
  },

  // --- Website structure / pages ---
  {
    weight: 2,
    keywords: ["pages", "sitemap", "navigate", "site structure", "sections of the site"],
    answer:
      "The main pages are Home, About, Services, Projects, Team, Insights, Contact, and Start a Project. Use the header navigation or the links I mention to get to any of them directly.",
  },

  // --- Auth / admin (kept high-level, no internals) ---
  {
    weight: 2,
    keywords: ["login", "log in", "sign up", "signup", "account", "forgot password", "reset password"],
    answer:
      "The site supports account creation, login/logout, and password reset. If you're having trouble with your account, the fastest fix is usually the \"Forgot password\" link on the login page - otherwise WhatsApp our team.",
  },
  {
    weight: 1,
    keywords: ["admin", "dashboard", "backend access"],
    answer:
      "6STANZA's admin area is internal and role-restricted - it's not something public visitors have access to. If you're looking for a customer-facing feature instead, let me know what you're trying to do.",
  },

  // --- Founding / employees / offices / awards (explicit non-fabrication) ---
  {
    weight: 2,
    keywords: ["founded", "when was 6stanza started", "how old is 6stanza", "history of 6stanza", "employee count", "how many people work", "how big is the company"],
    answer:
      "I don't currently have that information published. For specifics about the company's history or size, please reach out via the Start a Project page or WhatsApp and the team can answer directly.",
  },
  {
    weight: 2,
    keywords: ["award", "certification", "certified", "partner program", "partnership with"],
    answer:
      "I don't have any awards, certifications, or partnerships confirmed to share right now. If that's important for your decision, ask the team directly via WhatsApp or Contact.",
  },
  {
    weight: 2,
    keywords: ["client name", "which clients", "who are your clients", "case study result", "results you got", "revenue increase", "performance improvement"],
    answer:
      "I don't have specific client names or performance results to share here. You can browse real project write-ups on the Projects page, and for anything more specific, the team can walk you through it directly.",
  },
];

const fallbackAnswer =
  "I don't have a preset answer for that yet - try asking about our services (web dev, cloud, DevOps, security, networking, marketing, video, SEO), projects, pricing, team, or how to get in touch. For anything else, WhatsApp our team directly.";

/**
 * Tokenizes input and scores each FAQ entry by how many of its
 * keywords appear as substrings of the message, weighted so specific
 * entries (a named service) outrank generic catch-alls ("services").
 * Ties broken by keyword-hit count. Still zero-dependency, zero-cost -
 * just slightly smarter than first-match.
 */
function findAnswer(input: string): string {
  const normalized = input.toLowerCase().trim();
  if (!normalized) return fallbackAnswer;

  let best: { entry: FaqEntry; score: number } | null = null;

  for (const entry of faqEntries) {
    const hits = entry.keywords.filter((k) => normalized.includes(k)).length;
    if (hits === 0) continue;
    const score = hits * entry.weight;
    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  return best ? best.entry.answer : fallbackAnswer;
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
      text: "Hi! I'm the 6STANZA FAQ bot. Ask me about our services (web dev, cloud, DevOps, security, networking, marketing, video, SEO), projects, team, pricing, or contact — I reply instantly, no waiting.",
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
