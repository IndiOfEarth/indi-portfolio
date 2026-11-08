"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { parse } from "./Stream";
import { CifakeStats, Contact, Essays, ProfileCard, Quote, VideoCard } from "./Figures";

/* ------------------------------------------------------------------ */
/* Answers to typed questions, written from Indi's real portfolio.      */
/* ------------------------------------------------------------------ */
export type Answer = {
  text: string[];           // paragraphs, streamed in order (**bold**, *italic*, [links](url))
  extra?: ReactNode;        // a card shown after the text
  jump?: string;            // id of the full answer in the tour
  chips?: string[];         // follow-up questions
  email?: boolean;          // offer a pre-written email to Indi
};

export const EMAIL = "indi.caburian@outlook.com";
const FOLLOW = ["Who is Indi?", "What's PACT?", "What's the best project?", "How do I get in touch?"];

export const ANSWERS: Record<string, Answer> = {
  greeting: {
    text: ["Hi, nice to meet you. I'm a guide to Indi's work. Ask about the research, the projects, Indi's background, or how to get in touch."],
    chips: FOLLOW,
  },
  thanks: {
    text: ["Any time. Is there anything else you'd like to know about Indi?"],
    chips: ["What's Indi working on now?", "Is Indi open to work?", "What does Indi do for fun?"],
  },
  bot: {
    text: [
      "Not really. There's no live AI here. I match your question to answers written from Indi's real work, so everything I say is something you can check.",
      "The site is built with Next.js and React and hosted on Vercel. The conversation above streams in as you scroll.",
    ],
    chips: ["Who is Indi?", "Can Indi ship real software?"],
  },
  hire: {
    text: [
      "I'm biased, but here's the evidence:",
      "An AI-image detector at **81.63% test accuracy**, plus a robustness study that tested its own hypothesis and reported where it fell short. A React Native app that scored **91%**. A genetic-algorithms project that scored **85%**. A published essay on distributed systems.",
      "And four years in retail alongside an online degree, including managing and coaching teams of up to six, with a predicted First at the end of it.",
    ],
    extra: <Contact />,
  },
  who: {
    text: ["Indi Caburian is a final-year computer science student at the University of London (Goldsmiths), predicted a First and graduating in April 2027. Indi builds software, runs experiments until the results stop matching the expected story, and then writes about what happened."],
    extra: <ProfileCard />,
    jump: "who",
  },
  education: {
    text: [
      "A BSc in Computer Science at the University of London (Goldsmiths), studied online alongside work. Indi graduates in April 2027 with a **predicted First**.",
      "Highlights so far: **91%** for the FinTrack app and **85%** for the Evolving Creatures project. Before university, A* in Mathematics, Physics and Biology.",
    ],
    jump: "background",
  },
  skills: {
    text: [
      "Languages: **Python, TypeScript, JavaScript, Java, C++ and SQL**.",
      "Day to day that means TensorFlow and Keras for machine learning, React, React Native and Next.js for products, Node, PostgreSQL and Supabase on the back end, and Git, Docker and GitHub Actions around them.",
    ],
    jump: "background",
  },
  cifake: {
    text: ["Probably CIFAKE: an AI-image detector built only from dense layers, trained on 120,000 images, half real photos and half from Stable Diffusion. It reached **81.63% test accuracy**. The interesting part was finding out what it actually relied on."],
    extra: <CifakeStats />,
    jump: "cifake",
  },
  looking: {
    text: [
      "Not the tiny generator fingerprints Indi expected. JPEG compression and added noise barely moved accuracy, while downsampling cost **10.4 points** and greyscale **7.4**.",
      "So accuracy fell when a transformation *removed information*, not when it destroyed fine detail. That holds for one model on one dataset, and Indi is careful to say so.",
    ],
    jump: "looking",
  },
  pact: {
    text: [
      "PACT is Indi's final-year research. It asks how an AI agent should handle a request that involves money: when to act, when to ask a question first, and when to refuse.",
      "It's in progress, and every payment in it is simulated. Here's the proposal in brief:",
    ],
    extra: <VideoCard id="lTF-d59sEHg" title="PACT: the project proposal" label="PACT: the project proposal, in brief" sub="A short walkthrough of the research proposal" />,
    jump: "pact",
  },
  fintrack: {
    text: ["Yes. **FinTrack** is a React Native app for students to track spending, set budgets, keep receipts and follow stocks. It scored **91%** in the Mobile Development module, and the real work was underneath: authentication, a Postgres schema designed around Row-Level Security, and a server-side proxy so the API key never ships in the app."],
    jump: "fintrack",
  },
  creatures: {
    text: ["In a PyBullet physics simulation, Indi used genetic algorithms to evolve creatures that climb a mountain, across repeated 250-generation runs. It scored **85%**. The big lesson: a fitness score can reward behaviour you never intended, so designing the score is most of the work."],
    jump: "creatures",
  },
  writing: {
    text: ["Yes, mostly to check understanding. Indi's first published essay, written for fun to learn system design, is about Amazon's Dynamo and the cost of being always available. Another, on AI that acts instead of answers, is in draft."],
    extra: <Essays />,
    jump: "writing",
  },
  experience: {
    text: [
      "Alongside an online degree, Indi has worked in Tesco Mobile phone shops since 2022. That started with diagnosing device, network and account problems for customers.",
      "In 2024–25 Indi was Sales Manager, coaching teams of up to six across several stores: training, performance reviews and KPI-led improvements.",
    ],
    jump: "background",
  },
  available: {
    text: ["Yes. Indi is looking for **graduate software engineering roles starting in 2027**, after graduating in April. Conversations with researchers working on agents, multimodal models and AI safety are welcome too."],
    extra: <Contact />,
  },
  contact: {
    text: ["Email is the best way to reach Indi:"],
    extra: <Contact />,
  },
  location: {
    text: ["Indi is based in **Essex, in the UK**. For anything about relocating or working arrangements, it's best to ask Indi directly."],
    email: true,
  },
  reading: {
    text: ["Research papers, mostly the ones behind tools Indi already uses: Amazon's Dynamo, Scaling Memcache at Facebook, Dropout, Attention Is All You Need, and work on how image generators leave traces behind."],
    jump: "reading",
  },
  videos: {
    text: ["There are four: the PACT proposal, a FinTrack walkthrough, the evolving creatures, and a video on NAD v. Netflix and digital accessibility. Here's the newest:"],
    extra: <VideoCard id="lTF-d59sEHg" title="PACT: the project proposal" label="PACT: the project proposal, in brief" sub="A short walkthrough of the research proposal" />,
    chips: ["Show me FinTrack", "Tell me about the creatures"],
  },
  hobbies: {
    text: ["Outside the code: reading research papers for fun, writing essays, getting fitter with martial arts next on the list, and hoping to get to a first hackathon soon."],
    chips: ["What does Indi read?", "Does Indi write?"],
  },
  motivation: {
    text: ["In Indi's own words:"],
    extra: <Quote cite="Indi, being completely honest">I wake up every morning excited to write code and work on new projects.</Quote>,
    chips: ["What's Indi working on now?", "What are Indi's goals?"],
  },
  goals: {
    text: ["Next: graduate with a First in 2027 and join a team that takes engineering seriously. Then a master's, aiming for the 2028 intake. Longer term, Indi wants to build PACT into a company."],
    chips: ["What's PACT?", "Is Indi open to work?"],
  },
};

const NOT_SURE = [
  "Hmm, I'm not sure about that one. It isn't something I can find in Indi's portfolio.",
  "Good question, but I don't have an answer for it in Indi's portfolio.",
  "Hmm, that one's beyond what I know about Indi.",
];

/* ------------------------------------------------------------------ */
/* Streaming text for live replies (time-based, not scroll-based).     */
/* ------------------------------------------------------------------ */
function LiveText({ src, from, shown, done }: { src: string; from: number; shown: number; done: boolean }) {
  let n = from;
  const segs = parse(src);
  const out: ReactNode[] = [];
  segs.forEach((s, si) => {
    const parts = s.text.split(/(\s+)/);
    const inner = parts.map((p, pi) => {
      if (/^\s+$/.test(p) || p === "") return <Fragment key={pi}>{p}</Fragment>;
      const i = n++;
      const on = i < shown;
      return <span key={pi} className={`w${on ? " on" : ""}${on && !done && i === shown - 1 ? " caret" : ""}`}>{p}</span>;
    });
    if (s.kind === "b") out.push(<strong key={si}>{inner}</strong>);
    else if (s.kind === "i") out.push(<em key={si}>{inner}</em>);
    else if (s.kind === "a") out.push(<a key={si} href={s.href}>{inner}</a>);
    else out.push(<Fragment key={si}>{inner}</Fragment>);
  });
  return <p className="s">{out}</p>;
}

const countWords = (s: string) => parse(s).reduce((n, seg) => n + seg.text.split(/\s+/).filter(Boolean).length, 0);

/* ------------------------------------------------------------------ */
/* Email draft for questions the portfolio can't answer.               */
/* ------------------------------------------------------------------ */
function EmailDraft({ question }: { question: string }) {
  const [copied, setCopied] = useState(false);
  const subject = "A question from your portfolio";
  const body = `Hi Indi,\n\nI was looking at your portfolio and wanted to ask: ${question}\n\n`;
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="card mail">
      <div className="mail-row"><span>To</span><b>{EMAIL}</b></div>
      <div className="mail-row"><span>Subject</span><b>{subject}</b></div>
      <p className="mail-body">Hi Indi,<br /><br />I was looking at your portfolio and wanted to ask: <i>{question}</i></p>
      <div className="links">
        <a className="pillbtn solid" href={href}>Open in my email app</a>
        <button type="button" className="pillbtn" onClick={copy}>{copied ? "Copied" : "Copy Indi's email"}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One live question and its reply.                                    */
/* ------------------------------------------------------------------ */
export function LiveTurn({ q, id, seed, onAsk, onJump, jumpLabel }: {
  q: string; id: string | null; seed: number;
  onAsk: (q: string) => void; onJump: (id: string) => void; jumpLabel: (id: string) => string;
}) {
  const ans: Answer = useMemo(() => (id && ANSWERS[id]) || {
    text: [NOT_SURE[seed % NOT_SURE.length], "Want to ask Indi directly? I've drafted an email for you:"],
    email: true,
    chips: ["Who is Indi?", "What's the best project?", "Is Indi open to work?"],
  }, [id, seed]);
  const total = useMemo(() => ans.text.reduce((n, t) => n + countWords(t), 0), [ans]);
  const [phase, setPhase] = useState<"thinking" | "stream" | "done">("thinking");
  const [shown, setShown] = useState(0);
  const [extras, setExtras] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(total); setPhase("done"); setExtras(true); return; }
    const t1 = window.setTimeout(() => {
      setPhase("stream");
      const step = Math.min(34, Math.max(14, 2200 / total));
      let n = 0;
      const iv = window.setInterval(() => {
        n++;
        setShown(n);
        if (n >= total) {
          window.clearInterval(iv);
          setPhase("done");
          timers.current.push(window.setTimeout(() => setExtras(true), 60));
        }
      }, step);
      timers.current.push(iv as unknown as number);
    }, 650);
    timers.current.push(t1);
    const ts = timers.current;
    return () => ts.forEach((t) => { window.clearTimeout(t); window.clearInterval(t); });
  }, [total]);

  let offset = 0;
  return (
    <section className="turn live-turn" aria-label={q}>
      <div className="u on"><p>{q}</p></div>
      <div className={`a on${phase === "thinking" ? " thinking" : ""}`}>
        <div className="a-head"><span className="av" aria-hidden="true">i</span>Indi's portfolio <span className="think">Thinking</span></div>
        <div className="a-body" aria-live="polite">
          {phase !== "thinking" && ans.text.map((t, i) => {
            const from = offset;
            offset += countWords(t);
            return from < shown || i === 0 ? <LiveText key={i} src={t} from={from} shown={shown} done={phase === "done"} /> : null;
          })}
          {ans.extra && <div className={`blk${extras ? " on" : ""}`}>{extras && ans.extra}</div>}
          {ans.email && <div className={`blk${extras ? " on" : ""}`}>{extras && <EmailDraft question={q} />}</div>}
          {(ans.jump || ans.chips) && (
            <div className={`blk follow${extras ? " on" : ""}`}>
              {extras && ans.jump && <button type="button" className="pillbtn solid" onClick={() => onJump(ans.jump!)}>Show me the full answer: {jumpLabel(ans.jump)}</button>}
              {extras && ans.chips?.map((c) => <button key={c} type="button" className="chip" onClick={() => onAsk(c)}>{c}</button>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
