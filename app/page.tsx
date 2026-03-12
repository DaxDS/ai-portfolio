"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 420;
const CONNECTIONS_PER_NODE = 5;
const CONNECTION_MAX_DIST = 4.2;

function getNodePositions(): Float32Array {
  const arr = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 20;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }
  return arr;
}

function buildConnectionSegments(positions: Float32Array): Float32Array {
  const segments: number[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const ix = i * 3;
    const x0 = positions[ix];
    const y0 = positions[ix + 1];
    const z0 = positions[ix + 2];
    const neighbors: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const jx = j * 3;
      const dx = positions[jx] - x0;
      const dy = positions[jx + 1] - y0;
      const dz = positions[jx + 2] - z0;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < CONNECTION_MAX_DIST) neighbors.push({ j, d });
    }
    neighbors.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(CONNECTIONS_PER_NODE, neighbors.length); k++) {
      const j = neighbors[k].j;
      if (i < j) {
        segments.push(x0, y0, z0);
        segments.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  return new Float32Array(segments);
}

function NeuralNetworkScene() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, segmentArray } = useMemo(() => {
    const pos = getNodePositions();
    const seg = buildConnectionSegments(pos);
    return { positions: pos, segmentArray: seg };
  }, []);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(segmentArray, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [segmentArray]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.03;
    const tilt = Math.sin(state.clock.elapsedTime * 0.06) * 0.05;
    if (lineRef.current) {
      lineRef.current.rotation.y = t;
      lineRef.current.rotation.x = tilt;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t;
      pointsRef.current.rotation.x = tilt;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </lineSegments>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#fbbf24"
          size={0.12}
          sizeAttenuation
          depthWrite={false}
          opacity={0.55}
        />
      </Points>
    </group>
  );
}

const GITHUB_PROJECTS = [
  {
    section: "AI Agents & Intelligent Systems",
    title: "Agentic Orchestrator",
    desc: "Agentic AI orchestration—coordinating multiple agents with tool use, planning, and intelligent workflows.",
    repo: "agentic-orchestrator",
    url: "https://github.com/DaxDS/agentic-orchestrator",
    lang: "Python",
    tags: ["Agents", "Orchestration", "LLM"],
  },
  {
    section: "Computer Vision",
    title: "Facial Detection",
    desc: "Real-time face detection and recognition using computer vision and deep learning.",
    repo: "Facial-detection",
    url: "https://github.com/DaxDS/Facial-detection",
    lang: "Python",
    tags: ["Face Detection", "OpenCV", "Deep Learning"],
  },
  {
    section: "Computer Vision",
    title: "Volume Gesture",
    desc: "Gesture-based volume control—hand tracking for touchless system control.",
    repo: "volume-gesture",
    url: "https://github.com/DaxDS/volume-gesture",
    lang: "Python",
    tags: ["Gesture Control", "Hand Tracking", "MediaPipe"],
  },
  {
    section: "AI Applications",
    title: "Sports Scribe",
    desc: "AI-powered sports commentary generation—practical NLP for real-world content creation.",
    repo: "sports-scribe",
    url: "https://github.com/DaxDS/sports-scribe",
    lang: "Python",
    tags: ["NLP", "LLM", "Content Generation"],
  },
  {
    section: "AI Experiments / Research",
    title: "Projects",
    desc: "Model experiments, dataset analysis, and testing new architectures.",
    repo: "Projects",
    url: "https://github.com/DaxDS/Projects",
    lang: "Jupyter",
    tags: ["Experiments", "Research", "Notebooks"],
  },
];

const PROJECT_SECTIONS = [
  {
    name: "AI Agents & Intelligent Systems",
    id: "ai-agents-and-intelligent-systems",
    desc: "Agentic AI, orchestration, and intelligent workflows.",
  },
  {
    name: "AI-Powered Cybersecurity",
    id: "ai-powered-cybersecurity",
    desc: "AI for detecting and preventing cyber threats.",
  },
  {
    name: "AI Applications",
    id: "ai-applications",
    desc: "Practical AI systems that solve real problems.",
  },
  {
    name: "Computer Vision",
    id: "computer-vision",
    desc: "Machines understanding images and video.",
  },
  {
    name: "AI Experiments / Research",
    id: "ai-experiments-research",
    desc: "Model experiments, dataset analysis, and new architectures.",
  },
];

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
        <form onSubmit={handleSubmit} className="border-t border-zinc-800/80 px-3 py-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Sentinel: impossible travel sign-in from Brazil and Germany within 30 minutes…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="px-3 py-1.5 text-xs md:text-sm rounded-md bg-amber-500/80 hover:bg-amber-400 text-zinc-950 font-mono font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  // When opening the root URL (no hash), always start at the top so the hero shows first
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    const hash = window.location.hash;
    if (!hash || hash === "#") {
      window.scrollTo(0, 0);
      // Run again after paint to override browser scroll restoration (e.g. on Vercel)
      const t = setTimeout(() => window.scrollTo(0, 0), 0);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


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
      {/* 3D neural network — nodes + connections */}
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <NeuralNetworkScene />
        </Canvas>
      </div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#08081a]/80 pointer-events-none" />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-zinc-950/85 backdrop-blur-md py-3 border-zinc-800/50"
            : "bg-transparent py-6 border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="text-xl font-semibold tracking-tight font-mono text-amber-200/90">daksh.ai</span>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <a href="#about" className="nav-link hover:text-amber-200 transition-colors">About</a>
            <a href="#ai-agents-and-intelligent-systems" className="nav-link hover:text-amber-200 transition-colors">AI Agents</a>
            <a href="#ai-powered-cybersecurity" className="nav-link hover:text-amber-200 transition-colors">Cybersecurity</a>
            <a href="#ai-applications" className="nav-link hover:text-orange-200/90 transition-colors">Applications</a>
            <a href="#computer-vision" className="nav-link hover:text-amber-200 transition-colors">Vision</a>
            <a href="#ai-experiments-research" className="nav-link hover:text-orange-200/90 transition-colors">Research</a>
            <a href="#contact" className="nav-link hover:text-amber-200 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_30%,transparent_0%,rgba(2,6,24,0.9)_100%)] pointer-events-none" aria-hidden />
        <div className="max-w-4xl relative z-10">
          <p className="hero-badge animate-fade-in mb-6">
            SYS · AI ENGINEER
          </p>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
            <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-zinc-300 bg-clip-text text-transparent glow-text">
              Daksh Patel
            </span>
          </h1>
          <h2 className="mt-8 text-xl md:text-2xl lg:text-3xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200">
            Building intelligent systems that <span className="text-amber-200/90">learn</span>, <span className="text-orange-200/90">adapt</span>, and <span className="text-amber-100/90">secure</span> the digital frontier.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3 animate-fade-in-up animation-delay-300">
            {["ML", "LLMs", "Computer Vision", "AI Agents", "Cybersecurity"].map((label) => (
              <span
                key={label}
                className="px-4 py-2.5 rounded-lg bg-zinc-900/60 border border-amber-500/20 text-zinc-200 font-mono text-sm md:text-base font-medium backdrop-blur-md text-shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-14 flex gap-4 justify-center animate-fade-in-up animation-delay-400">
            <a
              href="#projects"
              className="px-8 py-4 rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-amber-100 transition-all text-lg font-medium font-mono"
            >
              View Work
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-lg border border-zinc-500/40 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-700/50 hover:border-amber-500/30 hover:text-amber-100 transition-all text-lg font-medium font-mono"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">
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
      <section id="skills" className="min-h-screen flex items-center justify-center px-6 py-24">
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
                "Cybersecurity AI", "Anomaly Detection", "Agents", "Fine-tuning"
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
      <section id="projects" className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="section-badge font-mono">03.</span>{" "}
            <span className="section-title">Projects</span>
          </h2>
          <p className="text-zinc-300 text-center text-lg mb-16 max-w-2xl mx-auto font-medium">
            Open-source projects from my{" "}
            <a href="https://github.com/DaxDS" target="_blank" rel="noopener noreferrer" className="text-amber-200/90 hover:text-amber-100 font-medium">
              GitHub
            </a>
          </p>
          {PROJECT_SECTIONS.map(({ name, id }) => (
            <div key={id} id={id} className="mb-16 scroll-mt-24">
              <h3 className="text-2xl font-semibold text-amber-200/90 mb-6 font-mono">{name}</h3>
              {id === "ai-powered-cybersecurity" && (
                <CyberAICopilotDemo />
              )}
              <div className="grid md:grid-cols-2 gap-6">
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
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <h2 className="text-4xl font-bold mb-4 text-center">
          <span className="section-badge font-mono">04.</span>{" "}
            <span className="section-title">Contact</span>
        </h2>
        <p className="text-zinc-300 mb-12 text-center max-w-md text-lg font-medium">
          Have a project in mind? Let&apos;s build something intelligent together.
        </p>
        <div className="security-card p-8 rounded-xl flex flex-wrap justify-center gap-8 text-lg max-w-xl">
          <a
            href="mailto:dakshpate201199@gmail.com"
            className="text-amber-200/90 hover:text-amber-100 font-mono transition-colors"
          >
            dakshpate201199@gmail.com
          </a>
          <a
            href="https://github.com/DaxDS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-amber-200 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/daxp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-orange-200/90 transition-colors"
          >
            LinkedIn
          </a>
        </div>
        <p className="mt-16 text-center text-white font-semibold text-sm tracking-wide font-mono">
          Designed & built by Daksh Patel
        </p>
      </section>
    </main>
  );
}
