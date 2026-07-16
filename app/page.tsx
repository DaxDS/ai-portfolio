"use client";

import { useState, useEffect, useRef, Component } from "react";
import dynamic from "next/dynamic";

const NeuralBackground = dynamic(() => import("./NeuralBackground"), { ssr: false });

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const GITHUB_PROJECTS = [
  {
    section: "AI Applications",
    title: "CareerOS",
    desc: "AI job-search copilot for the Canadian market—NOC 2021/TEER intelligence, immigration-pathway analysis, LangGraph agent workflows, and human-in-the-loop review in a full-stack monorepo.",
    repo: "career-os",
    url: "https://github.com/DaxDS/career-os",
    lang: "TypeScript / Python",
    tags: ["LangGraph", "Next.js", "Supabase", "Agents"],
  },
  {
    section: "AI Applications",
    title: "Frontier",
    desc: "Assistant-first personal dashboard—a daily brief where every number is live and source-labeled, and the AI names exactly one best action per day.",
    repo: "frontier",
    url: "https://github.com/DaxDS/frontier",
    lang: "TypeScript / Next.js",
    tags: ["AI Assistant", "Live Data", "Supabase"],
  },
  {
    section: "AI Applications",
    title: "BrandTax",
    desc: "Scan any product with your camera—vision AI identifies it, live-web search finds cheaper dupes with real prices, and it generates a shareable Brand Tax card.",
    repo: "brandtax",
    url: "https://github.com/DaxDS/brandtax",
    lang: "JavaScript / PWA",
    tags: ["Vision AI", "Live Web Search", "PWA"],
  },
  {
    section: "AI-Powered Cybersecurity",
    title: "AI SOC Copilot",
    desc: "Tier‑1 SOC copilot that triages alerts, builds investigation timelines, logs an audit trail, and generates investigation reports with an LLM-backed workflow.",
    repo: "AI-soc-copilot",
    url: "https://github.com/DaxDS/AI-soc-copilot",
    lang: "TypeScript / Next.js",
    tags: ["Cybersecurity", "LLM", "SOC Automation"],
  },
  {
    section: "AI Agents & Intelligent Systems",
    title: "Agentic Orchestrator",
    desc: "Agentic AI orchestration—coordinating multiple agents with tool use, planning, and intelligent workflows.",
    repo: "agentic-orchestrator",
    url: "https://github.com/DaxDS/agentic-orchestrator",
    lang: "Python",
    tags: ["Agents", "Orchestration", "LLM"],
  },
];

const PROJECT_SECTIONS = [
  {
    name: "AI Applications",
    id: "ai-applications",
    desc: "Practical AI products that solve real problems.",
  },
  {
    name: "AI-Powered Cybersecurity",
    id: "ai-powered-cybersecurity",
    desc: "AI for detecting and preventing cyber threats.",
  },
  {
    name: "AI Agents & Intelligent Systems",
    id: "ai-agents-and-intelligent-systems",
    desc: "Agentic AI, orchestration, and intelligent workflows.",
  },
].filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i);

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function CyberAICopilotDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your AI SOC copilot. Paste an alert or incident summary and I’ll triage it, enrich it, and suggest next steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/soc-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data?.error ?? res.statusText}. Try again.` },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message ?? "No response." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Check the console and try again." },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="security-card p-6 rounded-xl mb-8">
      <h4 className="text-xl font-semibold text-zinc-100 mb-2">
        AI SOC Copilot – Tier‑1 Triage Demo
      </h4>
      <p className="text-sm text-zinc-500 mb-4">
        This is a front-end demo of the SOC copilot I&apos;m building: paste an alert/incident summary and see how it would respond.
        The production version connects directly to SIEM/XDR, threat intel, and asset data for fully evidence-backed decisions.
      </p>
      <div className="h-64 md:h-72 rounded-lg bg-zinc-950/60 border border-amber-500/15 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-full md:max-w-[85%] whitespace-pre-line ${
                m.role === "user"
                  ? "ml-auto bg-amber-500/15 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-50"
                  : "mr-auto bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100"
              }`}
            >
              {m.content}
            </div>
          ))}
          {isThinking && (
            <div className="mr-auto bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-400 text-xs font-mono">
              Thinking like a Tier‑1 analyst…
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="border-t border-zinc-800/80 px-3 py-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste an alert or incident summary…"
            className="flex-1 min-w-0 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none py-2.5 sm:py-1.5"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="px-4 py-3 sm:py-1.5 rounded-md bg-amber-500/80 hover:bg-amber-400 text-zinc-950 font-mono font-semibold disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Expertise" },
  { href: "#contact", label: "Contact" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canRender3D, setCanRender3D] = useState(false);

  // Start at top when opening the site; gentle single run to avoid LinkedIn in-app browser closing.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const fx = params.get("fx"); // fx=0 disables, anything else enables if supported

      const canvas = document.createElement("canvas");
      const hasWebGL =
        !!(window as any).WebGLRenderingContext &&
        (!!canvas.getContext("webgl") || !!canvas.getContext("experimental-webgl"));

      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
      setCanRender3D(Boolean(hasWebGL) && !reducedMotion && fx !== "0");
    } catch {
      setCanRender3D(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLost = () => setCanRender3D(false);
    window.addEventListener("neuralbg:webglcontextlost", onLost as EventListener);
    return () => window.removeEventListener("neuralbg:webglcontextlost", onLost as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="relative w-full min-h-screen text-zinc-100 overflow-x-hidden">
      {/* Scan line effect */}
      <div className="scan-line" aria-hidden />
      {/* BACKGROUND — base + gradient + orbs + neural network (3D) + grid + noise */}
      <div className="fixed inset-0 -z-10 bg-[#08081a]" />
      <div className="fixed inset-0 -z-10 bg-neural-bg-gradient" />
      <div className="fixed inset-0 -z-10">
        <div className="glow-orb glow-orb-1" aria-hidden />
        <div className="glow-orb glow-orb-2" aria-hidden />
        <div className="glow-orb glow-orb-3" aria-hidden />
        <div className="glow-orb glow-orb-4" aria-hidden />
      </div>
      <div className="fixed inset-0 -z-10 neural-grid-strong" />
      <div className="fixed inset-0 -z-10 bg-noise" aria-hidden />
      {/* 3D neural network — lazy-loaded with fallback so page always loads on desktop */}
      <div className="fixed inset-0 -z-10">
        {canRender3D ? (
          <CanvasErrorBoundary
            fallback={
              <div
                className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-[#08081a]/90"
                aria-hidden
              />
            }
          >
            <NeuralBackground />
          </CanvasErrorBoundary>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-[#08081a]/90"
            aria-hidden
          />
        )}
      </div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#08081a]/80 pointer-events-none" />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-zinc-950/85 backdrop-blur-md py-3 border-zinc-800/50"
            : "bg-transparent py-4 md:py-6 border-transparent"
        }`}
      >
        <div className="w-full max-w-none px-5 sm:px-6 flex justify-between items-center gap-4">
          {/* Logo — left */}
          <a
            href="#"
            onClick={closeMenu}
            className="shrink-0 inline-block px-3 py-1.5 rounded-lg text-lg sm:text-xl font-semibold tracking-tight font-mono text-amber-200/90 border border-transparent hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors"
            aria-label="daksh.ai – back to top"
          >
            daksh.ai
          </a>
          {/* Desktop nav — right */}
          <div className="hidden md:flex flex-wrap gap-4 justify-end text-base font-mono font-semibold text-zinc-100">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link px-3 py-1.5 rounded-lg hover:text-amber-200 hover:bg-zinc-900/60 border border-transparent hover:border-amber-500/30 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-amber-200 transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/98 backdrop-blur-md border-b border-zinc-800/50 shadow-xl">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="nav-link py-3 px-3 rounded-lg hover:bg-zinc-800/50 hover:text-amber-200 text-zinc-100 text-base min-h-[44px] flex items-center font-mono font-semibold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_30%,transparent_0%,rgba(2,6,24,0.9)_100%)] pointer-events-none" aria-hidden />
        <div className="max-w-4xl relative z-10 w-full">
          <p className="hero-badge animate-fade-in mb-4 sm:mb-6">
            SYS · AI ENGINEER
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
            <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-zinc-300 bg-clip-text text-transparent glow-text">
              Daksh Patel
            </span>
          </h1>
          <h2 className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200 px-1">
            Building intelligent systems that <span className="text-amber-200/90">learn</span>, <span className="text-orange-200/90">adapt</span>, and <span className="text-amber-100/90">secure</span> the digital frontier.
          </h2>
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2 md:gap-3 animate-fade-in-up animation-delay-300">
            {PROJECT_SECTIONS.map(({ name, id }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-4 py-2.5 rounded-lg bg-zinc-900/60 border border-amber-500/20 text-zinc-200 font-mono text-sm md:text-base font-medium backdrop-blur-md text-shadow-sm hover:border-amber-400/60 hover:text-amber-100 transition-colors"
              >
                {name}
              </a>
            ))}
          </div>
          <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up animation-delay-400">
            <a
              href="#projects"
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-amber-100 transition-all text-base sm:text-lg font-medium font-mono text-center min-h-[48px] flex items-center justify-center"
            >
              View Work
            </a>
            <a
              href="#contact"
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg border border-zinc-500/40 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-700/50 hover:border-amber-500/30 hover:text-amber-100 transition-all text-base sm:text-lg font-medium font-mono text-center min-h-[48px] flex items-center justify-center"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center">
            <span className="section-badge font-mono">01.</span>{" "}
            <span className="section-title">About</span>
          </h2>
          <div className="security-card about-card p-8 md:p-10 rounded-xl backdrop-blur-sm">
            <p className="text-zinc-300 text-lg md:text-xl leading-loose tracking-wide">
              I design and deploy AI systems that <span className="text-amber-200 font-medium">secure</span>, analyze, and understand the digital world.
              From large language models and intelligent agents to computer vision and AI-powered
              cybersecurity—I work at the intersection of machine learning and real-world impact.
            </p>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative max-w-4xl mx-auto w-full">
          <div
            className="pointer-events-none absolute inset-x-0 top-16 bottom-8 mx-auto max-w-4xl rounded-3xl bg-gradient-to-b from-zinc-950/85 via-zinc-950/80 to-zinc-950/90 shadow-[0_0_60px_rgba(0,0,0,0.75)]"
            aria-hidden
          />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              <span className="section-badge font-mono">02.</span>{" "}
              <span className="section-title">Expertise</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI",
                "Computer Vision", "NLP", "LLMs", "RAG", "Vector DBs",
                "Cybersecurity AI", "Anomaly Detection", "Agents", "Fine-tuning",
                "MLOps"
              ].map((skill) => (
                <div
                  key={skill}
                  className="security-card p-5 rounded-xl text-center group"
                >
                  <span className="text-zinc-300 text-lg group-hover:text-amber-200/90 transition-colors">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center">
            <span className="section-badge font-mono">03.</span>{" "}
            <span className="section-title">Projects</span>
          </h2>
          <p className="text-zinc-300 text-center text-base sm:text-lg mb-10 sm:mb-16 max-w-2xl mx-auto font-medium px-1">
            Open-source projects from my{" "}
            <a href="https://github.com/DaxDS" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-amber-200 font-medium transition-colors">
              GitHub
            </a>
          </p>
          {PROJECT_SECTIONS.filter(
            (s) => s.id === "ai-powered-cybersecurity" || GITHUB_PROJECTS.some((p) => p.section === s.name)
          ).map(({ name, id }) => (
            <div key={id} id={id} className="mb-16 scroll-mt-24">
              <h3 className="text-2xl font-semibold text-amber-200/90 mb-6 font-mono">{name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {GITHUB_PROJECTS.filter((p) => p.section === name).length > 0 ? (
                  GITHUB_PROJECTS.filter((p) => p.section === name).map((project) => (
                    <div
                      key={project.repo}
                      className="security-card block p-6 rounded-xl transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xl font-semibold text-zinc-300 group-hover:text-amber-200/90">{project.title}</h4>
                        <span className="text-amber-200/70 text-sm font-mono shrink-0">{project.lang}</span>
                      </div>
                      <p className="mt-2 text-zinc-400">{project.desc}</p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-sm px-3 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-100/90">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-zinc-500 group-hover:text-amber-200/90 font-mono">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded"
                        >
                          View code <span aria-hidden>→</span>
                        </a>
                      </p>
                    </div>
                  ))
                ) : null}
              </div>
              {id === "ai-powered-cybersecurity" && (
                <div className="mt-8 rounded-xl overflow-hidden border border-amber-500/15 shadow-lg">
                  <img
                    src="/soc-investigation-console.png"
                    alt="AI SOC Investigation Console — incident queue, investigation chat, timeline, IOCs, and threat intel lookup"
                    className="w-full h-auto object-contain bg-zinc-950/60"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
          <span className="section-badge font-mono">04.</span>{" "}
            <span className="section-title">Contact</span>
        </h2>
        <p className="text-zinc-300 mb-6 sm:mb-8 text-center max-w-md text-sm sm:text-base font-medium px-1">
          Have a project in mind? Let&apos;s build something intelligent together.
        </p>
        <div className="security-card px-5 py-4 sm:px-6 sm:py-5 rounded-xl flex flex-col justify-center items-center gap-4 text-base max-w-md w-full">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5">
            <a
              href="https://www.linkedin.com/in/daxp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-orange-200/90 transition-colors py-2 px-3 rounded-lg min-h-[40px] flex items-center justify-center text-sm sm:text-base"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/DaxDS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-amber-200 transition-colors py-2 px-3 rounded-lg min-h-[40px] flex items-center justify-center text-sm sm:text-base"
            >
              GitHub
            </a>
          </div>
          <a
            href="mailto:dakshpate201199@gmail.com"
            className="text-amber-200/90 hover:text-amber-100 font-mono transition-colors py-2 px-3 rounded-lg min-h-[40px] flex items-center justify-center text-center break-all text-sm sm:text-base"
          >
            dakshpate201199@gmail.com
          </a>
        </div>
        <p className="mt-16 sm:mt-20 text-center text-white font-semibold text-sm tracking-wide font-mono">
          Designed & built by Daksh Patel
        </p>
      </section>
    </main>
  );
}
