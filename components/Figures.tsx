"use client";

import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const cssVar = (n: string) =>
  typeof window === "undefined" ? "#111" : getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */
export function ProfileCard() {
  return (
    <div className="card profile">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="portrait" src={ASSETS.photo} alt="Indi Caburian" />
      <div className="profile-info">
        <h3>Indi Caburian</h3>
        <div className="meta">BSc Computer Science, University of London (Goldsmiths). Essex, UK.</div>
        <div className="facts">
          <div><b>Predicted First</b>Class Honours</div>
          <div><b>April 2027</b>Expected graduation</div>
          <div><b>A*A*A*</b>Maths, Physics, Biology</div>
          <div><b>91% and 85%</b>FinTrack and Evolving Creatures</div>
        </div>
        <div className="links">
          <a className="pillbtn solid" href="https://github.com/IndiOfEarth">GitHub</a>
          <a className="pillbtn" href="https://www.linkedin.com/in/ind1-caburian/">LinkedIn</a>
          <a className="pillbtn" href="https://medium.com/@indi.caburian">Medium</a>
        </div>
      </div>
    </div>
  );
}

export function Quote({ children, cite }: { children: string; cite: string }) {
  return (
    <blockquote className="quote">
      “{children}”<cite>{cite}</cite>
    </blockquote>
  );
}

/* ------------------------------------------------------------------ */
/* CIFAKE: the image as the model saw it                               */
/* ------------------------------------------------------------------ */
export function VectorFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState(0);
  const [read, setRead] = useState("Hover over the image to read its values.");
  const st = useRef({ T: 0, target: 0, anim: 0, src: new Float32Array(32 * 32 * 3), ready: false });

  const N = 32, W = 640, H = 480;
  const IMG = { cell: 13, x0: (W - 13 * 32) / 2, y0: (H - 13 * 32) / 2 };
  const VEC = { cols: 64, cell: 10 };

  const draw = () => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const { T, src, ready } = st.current;
    g.fillStyle = cssVar("--sheet");
    g.fillRect(0, 0, W, H);
    if (!ready) return;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const chan = (v: number, ch: number) => {
      const k = Math.round(v * 255);
      return ch === 0
        ? `rgb(${k},${Math.round(k * 0.12)},${Math.round(k * 0.14)})`
        : ch === 1
          ? `rgb(${Math.round(k * 0.12)},${Math.round(k * 0.82)},${Math.round(k * 0.3)})`
          : `rgb(${Math.round(k * 0.16)},${Math.round(k * 0.36)},${k})`;
    };
    for (let p = 0; p < N * N; p++) {
      const px = p % N, py = Math.floor(p / N);
      for (let ch = 0; ch < 3; ch++) {
        const k = p * 3 + ch;
        const lt = ease(clamp((T - (k / 3072) * 0.55) / 0.45));
        const ax = IMG.x0 + px * IMG.cell, ay = IMG.y0 + py * IMG.cell;
        const bx = (k % VEC.cols) * VEC.cell, by = Math.floor(k / VEC.cols) * VEC.cell;
        const x = ax + (bx - ax) * lt, y = ay + (by - ay) * lt, s = IMG.cell + (VEC.cell - IMG.cell) * lt;
        if (lt < 0.02) {
          if (ch === 0) {
            const i = p * 3;
            g.fillStyle = `rgb(${src[i] * 255},${src[i + 1] * 255},${src[i + 2] * 255})`;
            g.fillRect(x, y, s + 0.5, s + 0.5);
          }
        } else {
          g.fillStyle = chan(src[k], ch);
          const gap = lt > 0.9 ? 1 : 0;
          g.fillRect(x, y, s - gap, s - gap);
        }
      }
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = N; c.height = N;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0, N, N);
      const d = x.getImageData(0, 0, N, N).data;
      for (let p = 0; p < N * N; p++) for (let k = 0; k < 3; k++) st.current.src[p * 3 + k] = d[p * 4 + k] / 255;
      st.current.ready = true;
      draw();
    };
    img.src = ASSETS.heroCar;
    draw();
    return () => cancelAnimationFrame(st.current.anim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (to: number) => {
    setMode(to);
    const s = st.current;
    s.target = to;
    if (prefersReduced()) { s.T = to; draw(); return; }
    cancelAnimationFrame(s.anim);
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      s.T = clamp(s.T + (s.target ? 1 : -1) * dt / 1.6);
      draw();
      if ((s.target && s.T < 1) || (!s.target && s.T > 0)) s.anim = requestAnimationFrame(step);
    };
    s.anim = requestAnimationFrame(step);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!s.ready) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) * W) / r.width, y = ((e.clientY - r.top) * H) / r.height;
    const names = ["red", "green", "blue"];
    if (s.T < 0.5) {
      const px = Math.floor((x - IMG.x0) / IMG.cell), py = Math.floor((y - IMG.y0) / IMG.cell);
      if (px < 0 || py < 0 || px >= N || py >= N) return;
      const i = (py * N + px) * 3;
      setRead(`Pixel (${px}, ${py}): red ${s.src[i].toFixed(2)}, green ${s.src[i + 1].toFixed(2)}, blue ${s.src[i + 2].toFixed(2)}`);
    } else {
      const k = Math.floor(y / VEC.cell) * VEC.cols + Math.floor(x / VEC.cell);
      if (k < 0 || k >= 3072) return;
      const p = Math.floor(k / 3);
      setRead(`Input ${(k + 1).toLocaleString("en-GB")} of 3,072 = ${s.src[k].toFixed(2)}, the ${names[k % 3]} value of pixel (${p % N}, ${Math.floor(p / N)})`);
    }
  };

  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h">
        <span>A real photo from the test set</span>
        <div className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={mode === 0} onClick={() => go(0)}>As you see it</button>
          <button type="button" aria-pressed={mode === 1} onClick={() => go(1)}>As the model saw it</button>
        </div>
      </div>
      <canvas ref={ref} className="see" width={W} height={H} onPointerMove={onMove}
        aria-label="A 32 by 32 pixel photograph of a red car that unravels into 3,072 numbers" />
      <div className="readout" aria-live="polite">{read}</div>
      <figcaption className="cap"><b>The model scored this real photograph 0.999 for AI-generated.</b> Switch views to see what it actually received: 3,072 numbers, red, green and blue for every pixel, with no idea which ones sit next to each other.</figcaption>
    </figure>
  );
}

export function CifakeStats() {
  return (
    <div className="stats">
      <div><b>81.63%</b>Test accuracy, mean of 3 seeds (± 0.82)</div>
      <div><b>0.9117</b>Test ROC-AUC</div>
      <div><b>120,000</b>Images, half real, half Stable Diffusion 1.4</div>
      <div><b>27</b>Experimental runs to the final model</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CIFAKE: transformations and mistakes                                */
/* ------------------------------------------------------------------ */
const TX = [
  { id: "down", row: 6, name: "Downsampling ×4", drop: 10.4, note: "The biggest drop. Shrinking the image removes information outright, and the model needed it." },
  { id: "grey", row: 12, name: "Greyscale", drop: 7.4, note: "Taking the colour away cost 7.4 points, far more than Indi predicted." },
  { id: "contrast", row: 11, name: "Contrast", drop: 4.9, note: "Fine detail survives, but the colour statistics shift: down 4.9 points." },
  { id: "blur", row: 7, name: "Gaussian blur", drop: 4.7, note: "Blurring smooths away detail and some structure: down 4.7 points." },
  { id: "flip", row: 9, name: "Horizontal flip", drop: 0.85, note: "A mirror image changes almost nothing the model relied on." },
  { id: "bright", row: 10, name: "Brightness", drop: 0.3, note: "Barely noticed: 0.3 points." },
  { id: "jpeg", row: 4, name: "JPEG, quality 25", drop: null, note: "The one Indi expected to hurt most. Even heavy compression cost under a point." },
  { id: "noise", row: 8, name: "Added noise", drop: null, note: "Under a point again. Perturbing pixels mattered far less than removing information." },
] as const;

function Tile({ row, col }: { row: number; col: number }) {
  return (
    <div className="ts" style={{ backgroundImage: `url("${ASSETS.transforms}")`, backgroundPosition: `${col * 50}% ${(row / 13) * 100}%` }} />
  );
}

export function TransformExplorer() {
  const [sel, setSel] = useState<string>("down");
  const t = TX.find((x) => x.id === sel)!;
  const MAX = 11;
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h"><span>What each transformation cost</span></div>
      <div className="tx">
        <div>
          <p className="tlabel"><b>Clean</b> test images</p>
          <div className="trow">{[0, 1, 2].map((c) => <Tile key={c} row={0} col={c} />)}</div>
          <p className="tlabel"><b>{t.name}</b></p>
          <div className="trow">{[0, 1, 2].map((c) => <Tile key={c} row={t.row} col={c} />)}</div>
          <p className="tx-note">{t.note}</p>
        </div>
        <div className="bars">
          <div className="axis" aria-hidden="true">
            <span>Accuracy lost</span>
            <div className="ticks">{[0, 2, 4, 6, 8, 10].map((v) => <span key={v} style={{ left: `${(v / MAX) * 100}%` }}>{v}</span>)}</div>
            <span />
          </div>
          <div role="group" aria-label="Transformations. Select one to see it applied to real test images.">
            {TX.map((x) => (
              <button key={x.id} type="button" className="bar" aria-pressed={sel === x.id} onClick={() => setSel(x.id)}
                aria-label={`${x.name}: ${x.drop == null ? "under one point lost" : x.drop + " points lost"}`}>
                <span>{x.name}</span>
                <span className="track"><span className={`fill${x.drop == null ? " lt" : ""}`} style={{ width: `${((x.drop ?? 0.9) / MAX) * 100}%` }} /></span>
                <span className="val">{x.drop == null ? "< 1" : `−${x.drop}`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="cap"><b>Select a row to see it applied to three real test images.</b> Percentage points lost from the clean 81.63%, for 8 of the 13 transformations. Hatched bars stayed under one point at every strength tested.</figcaption>
    </figure>
  );
}

export function Mistakes() {
  const realScores = ["0.999", "0.999", "0.999", "1.000", "1.000", "1.000"];
  const aiScores = ["0.000", "0.001", "0.001", "0.002", "0.002", "0.002"];
  const realAlt = ["a horse and rider", "a red sports car", "a horse and rider", "a plane", "a dog", "a boat"];
  const aiAlt = ["a horse and rider in sepia", "a horse and rider in greyscale", "a golden retriever", "a ginger and white cat", "a black cat", "a blurred green scene"];
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="mist">
        <div>
          <h4>Real photos it was sure were AI-generated <span>(score for AI)</span></h4>
          <div className="tiles">
            {ASSETS.realAsAi.map((src, i) => (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Real photo: ${realAlt[i]}`} />
                <figcaption>{realScores[i]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div>
          <h4>AI images it was sure were real</h4>
          <div className="tiles">
            {ASSETS.aiAsReal.map((src, i) => (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`AI image: ${aiAlt[i]}`} />
                <figcaption>{aiScores[i]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="cap"><b>Straight from Indi's notebook.</b> The real photos it got wrong are vivid and busy; the fakes it trusted are muted, some almost greyscale.</figcaption>
    </figure>
  );
}

export function CapacityGrid() {
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="exhibit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ASSETS.grid} alt="Validation accuracy against layer width. Two and three hidden layers stay between 0.78 and 0.80 at every width; one hidden layer rises from about 0.66 at 64 units to about 0.73 at 512." />
        <div>
          <p className="big">Eight times fewer parameters, 5.5 points better.</p>
          <p>Validation accuracy across the capacity grid, mean ± standard deviation over three runs. From Indi's notebook.</p>
        </div>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Evolving creatures: a toy genetic algorithm                         */
/* ------------------------------------------------------------------ */
type Walker = { g: number[]; pts: [number, number][]; fit: number };

export function GaFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [gen, setGen] = useState(0);
  const [best, setBest] = useState(0);
  const [mut, setMut] = useState(0.04);
  const S = useRef({ running: true, mut: 0.04, pop: [] as Walker[], gen: 0, visible: false, reset: () => {} });

  useEffect(() => { S.current.running = running; }, [running]);
  useEffect(() => { S.current.mut = mut; }, [mut]);

  useEffect(() => {
    const canvas = ref.current!;
    const g = canvas.getContext("2d")!;
    const GW = 960, GH = 540;
    const peaks = [{ x: 0.78, y: 0.3, s: 0.17, a: 1 }, { x: 0.3, y: 0.66, s: 0.09, a: 0.58 }, { x: 0.58, y: 0.78, s: 0.07, a: 0.3 }];
    const height = (x: number, y: number) => {
      let h = 0;
      for (const p of peaks) { const dx = x - p.x, dy = ((y - p.y) * GH) / GW; h += p.a * Math.exp(-(dx * dx + dy * dy) / (p.s * p.s)); }
      return h;
    };
    let HMAX = 0;
    for (let y = 0; y <= 1; y += 0.005) for (let x = 0; x <= 1; x += 0.005) HMAX = Math.max(HMAX, height(x, y));
    const map = document.createElement("canvas"); map.width = GW; map.height = GH;
    const drawMap = () => {
      const m = map.getContext("2d")!, ink = cssVar("--ink");
      m.fillStyle = cssVar("--sheet"); m.fillRect(0, 0, GW, GH);
      const step = 3, bands = 16, cols = Math.ceil(GW / step) + 1, rows = Math.ceil(GH / step) + 1;
      const B = new Int16Array(cols * rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) B[j * cols + i] = Math.floor((height((i * step) / GW, (j * step) / GH) / HMAX) * bands);
      m.fillStyle = ink;
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const b = B[j * cols + i];
        if (b !== B[j * cols + i + 1] || b !== B[(j + 1) * cols + i]) { m.globalAlpha = 0.12 + 0.3 * (b / bands); m.fillRect(i * step, j * step, 1.6, 1.6); }
      }
      m.globalAlpha = 1;
      const mk = (p: { x: number; y: number }, label: string) => {
        m.fillStyle = ink; m.font = "italic 24px Newsreader, Georgia, serif";
        m.fillText(label, p.x * GW + 14, p.y * GH - 8);
        m.beginPath(); m.moveTo(p.x * GW - 7, p.y * GH + 5); m.lineTo(p.x * GW + 7, p.y * GH + 5); m.lineTo(p.x * GW, p.y * GH - 7); m.closePath(); m.fill();
      };
      mk(peaks[0], "Summit"); mk(peaks[1], "Foothill");
    };
    const POP = 60, STEPS = 40, LEN = 0.03, START = { x: 0.08, y: 0.88 }, ELITE = 2, GENS = 250;
    const rnd = Math.random, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87;
    const walk = (genome: number[]) => {
      const pts: [number, number][] = [[START.x, START.y]];
      let x = START.x, y = START.y;
      for (const a of genome) { x = clamp(x + Math.cos(a) * LEN, 0.01, 0.99); y = clamp(y + ((Math.sin(a) * LEN * GW) / GH), 0.01, 0.99); pts.push([x, y]); }
      return { pts, fit: height(x, y) / HMAX };
    };
    const newPop = (): Walker[] => Array.from({ length: POP }, () => { const gm = Array.from({ length: STEPS }, () => rnd() * Math.PI * 2); return { g: gm, ...walk(gm) }; });
    const s = S.current;
    const pick = () => { let b: Walker | null = null; for (let i = 0; i < 3; i++) { const c = s.pop[Math.floor(rnd() * POP)]; if (!b || c.fit > b.fit) b = c; } return b!; };
    const evolve = () => {
      s.pop.sort((a, b) => b.fit - a.fit);
      const next = s.pop.slice(0, ELITE).map((p) => ({ ...p }));
      while (next.length < POP) {
        const a = pick(), b = pick(), cut = Math.floor(rnd() * STEPS);
        const child = a.g.map((v, i) => (i < cut ? v : b.g[i]));
        for (let i = 0; i < STEPS; i++) if (rnd() < s.mut) child[i] += gauss() * 1.2;
        next.push({ g: child, ...walk(child) });
      }
      s.pop = next; s.gen++;
    };
    const draw = () => {
      g.drawImage(map, 0, 0);
      const ink = cssVar("--ink");
      s.pop.sort((a, b) => b.fit - a.fit);
      const top = s.pop[0];
      g.lineWidth = 1.2; g.strokeStyle = ink; g.globalAlpha = 0.16;
      for (let i = s.pop.length - 1; i > 0; i--) { const p = s.pop[i].pts; g.beginPath(); g.moveTo(p[0][0] * GW, p[0][1] * GH); for (const q of p) g.lineTo(q[0] * GW, q[1] * GH); g.stroke(); }
      g.globalAlpha = 0.55; g.fillStyle = ink;
      for (const p of s.pop) { const e = p.pts[p.pts.length - 1]; g.beginPath(); g.arc(e[0] * GW, e[1] * GH, 3, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.lineWidth = 3.5; g.lineJoin = "round"; g.beginPath();
      top.pts.forEach((q, i) => (i ? g.lineTo(q[0] * GW, q[1] * GH) : g.moveTo(q[0] * GW, q[1] * GH))); g.stroke();
      const e = top.pts[top.pts.length - 1];
      g.fillStyle = cssVar("--sheet"); g.beginPath(); g.arc(e[0] * GW, e[1] * GH, 8, 0, 7); g.fill(); g.lineWidth = 3; g.stroke();
      g.fillStyle = ink; g.beginPath(); g.arc(START.x * GW, START.y * GH, 6, 0, 7); g.fill();
      setGen(s.gen); setBest(Math.round(top.fit * 100));
    };
    s.reset = () => { s.gen = 0; s.pop = newPop(); draw(); };
    drawMap(); s.pop = newPop(); for (let i = 0; i < 12; i++) evolve(); draw();
    if (prefersReduced()) { s.running = false; setRunning(false); }
    let raf = 0, lastT = 0;
    const loop = (now: number) => {
      if (s.running && s.visible && s.gen < GENS && now - lastT > 70) { evolve(); draw(); lastT = now; }
      if (s.gen >= GENS && s.running) { s.running = false; setRunning(false); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver((es) => { s.visible = es[0].isIntersecting; }, { threshold: 0.3 });
    io.observe(canvas);
    document.fonts?.ready.then(() => { drawMap(); draw(); });
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const finished = gen >= 250 && !running;
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h"><span>A genetic algorithm, running live in your browser</span></div>
      <canvas ref={ref} className="ga" width={960} height={540} aria-label="Contour map with evolving paths climbing towards a summit" />
      <div className="controls">
        <button className="pillbtn" type="button" disabled={finished} onClick={() => setRunning((r) => !r)}>{finished ? "Finished" : running ? "Pause" : "Run"}</button>
        <button className="pillbtn" type="button" onClick={() => { S.current.reset(); setRunning(true); }}>Start again</button>
        <label>Mutation rate <input type="range" min={0.005} max={0.25} step={0.005} value={mut} onChange={(e) => setMut(+e.target.value)} /> <span className="stat">{Math.round(mut * 1000) / 10}%</span></label>
        <span className="stat">Generation <b>{gen}</b> of 250. Best <b>{best}%</b> of the summit</span>
      </div>
      <figcaption className="cap"><b>60 walkers, 40 steps each, starting bottom left.</b> Fitness is where a walker ends up; the thick line is the best of each generation. Low mutation often settles on the foothill, a local optimum. A small toy built for this page; the real PyBullet creatures are in the video.</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Dynamo: one failure, two kinds of data                              */
/* ------------------------------------------------------------------ */
export function DynamoFigure() {
  const [wl, setWl] = useState<"cart" | "pay">("cart");
  const [step, setStep] = useState(2);
  const CX = 300, CY = 190, R = 120;
  const NODES = ["A", "B", "C", "D", "E"].map((n, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return { n, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }; });
  const cart = wl === "cart";
  type NS = { v: string; clock: string; state: "ok" | "w" | "no" | "m" };
  const nodes: Record<string, NS> = {};
  NODES.forEach((n) => (nodes[n.n] = { v: cart ? "book" : "£40", clock: cart ? "[A:1]" : "balance", state: "ok" }));
  let note = "";
  let clients: { side: "L" | "R"; ok: boolean; t: string }[] = [];
  if (step === 0) note = cart ? "All five replicas hold the same cart: one book, version [A:1]." : "All five replicas agree the balance is £40.";
  if (step === 1) note = "D and E can no longer reach A, B and C. Both sides keep running.";
  if (step >= 2) {
    if (cart) {
      ["A", "B", "C"].forEach((n) => (nodes[n] = { v: "book, mug", clock: "[A:2]", state: "w" }));
      ["D", "E"].forEach((n) => (nodes[n] = { v: "book, lamp", clock: "[A:1, D:1]", state: "w" }));
      clients = [{ side: "R", ok: true, t: "Add mug" }, { side: "L", ok: true, t: "Add lamp" }];
      note = "Both writes succeed. The sides now hold different carts with concurrent version clocks, so neither is simply newer.";
    } else {
      ["A", "B", "C"].forEach((n) => (nodes[n] = { v: "£25", clock: "debit £15", state: "w" }));
      ["D", "E"].forEach((n) => (nodes[n] = { ...nodes[n], state: "no" }));
      clients = [{ side: "R", ok: true, t: "Pay £15" }, { side: "L", ok: false, t: "Pay £30" }];
      note = "The majority side accepts the £15 payment. D and E can't reach a majority, so the £30 payment is refused.";
    }
  }
  if (step === 3) {
    if (cart) { NODES.forEach((n) => (nodes[n.n] = { v: "book, mug, lamp", clock: "[A:2, D:1]", state: "m" })); note = "When the network heals, the versions merge. Nothing the customer added is lost, though the paper notes a deleted item can come back."; }
    else { NODES.forEach((n) => (nodes[n.n] = { v: "£25", clock: "debit £15", state: "m" })); note = "There was only ever one history. One customer saw an error, and nobody spent £45 from a £40 balance."; }
  }
  const split = step >= 1 && step < 3;
  const F = { fontFamily: "Hanken Grotesk, Arial, sans-serif" };
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h">
        <span>One network failure, two kinds of data</span>
        <div className="seg" role="group" aria-label="Workload">
          <button type="button" aria-pressed={cart} onClick={() => setWl("cart")}>Shopping cart</button>
          <button type="button" aria-pressed={!cart} onClick={() => setWl("pay")}>Payment</button>
        </div>
      </div>
      <div className="dyn">
        <svg className="ring" viewBox="0 0 600 390" role="img" aria-label={note}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--rule)" strokeWidth={1.5} />
          {split && (
            <>
              <line x1={CX - 72} y1={40} x2={CX + 6} y2={350} stroke="var(--stop)" strokeWidth={2} strokeDasharray="7 6" />
              <text x={CX - 72} y={28} textAnchor="middle" fill="var(--stop)" style={F} fontSize={14} fontWeight={600}>network partition</text>
            </>
          )}
          {NODES.map((n) => {
            const s = nodes[n.n], filled = s.state === "w" || s.state === "m";
            const right = n.x >= CX, lx = n.x + (right ? 36 : -36);
            return (
              <g key={n.n}>
                <circle cx={n.x} cy={n.y} r={26} fill={filled ? "var(--ink)" : "var(--sheet)"} stroke={s.state === "no" ? "var(--stop)" : "var(--ink)"} strokeWidth={1.5} />
                <text x={n.x} y={n.y + 7} textAnchor="middle" fill={filled ? "var(--sheet)" : "var(--ink)"} fontFamily="Newsreader, Georgia, serif" fontSize={21} fontStyle="italic">{n.n}</text>
                <text x={lx} y={n.y - 2} textAnchor={right ? "start" : "end"} fill={s.state === "no" ? "var(--stop)" : "var(--ink)"} style={F} fontSize={14} fontWeight={600}>{s.state === "no" ? "refused" : s.v}</text>
                <text x={lx} y={n.y + 15} textAnchor={right ? "start" : "end"} fill="var(--muted)" style={F} fontSize={12}>{s.state === "no" ? "no majority" : s.clock}</text>
              </g>
            );
          })}
          {clients.map((c) => (
            <text key={c.t} x={c.side === "R" ? CX + 130 : CX - 150} y={376} textAnchor="middle" fill={c.ok ? "var(--ok)" : "var(--stop)"} style={F} fontSize={14} fontWeight={600}>{`${c.t}: ${c.ok ? "accepted" : "refused"}`}</text>
          ))}
        </svg>
        <div>
          <ol className="steps">
            {["Healthy network", "The network splits", "A write on each side", "The network heals"].map((t, i) => (
              <li key={t}><button type="button" aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)}><span>{i + 1}</span><span>{t}</span></button></li>
            ))}
          </ol>
          <p className="dyn-note" aria-live="polite">{note}</p>
        </div>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* PACT: a chat inside the chat                                        */
/* ------------------------------------------------------------------ */
type Src = [string, string?];
type LinkState = { v: number; payee: [string, Src[]]; amount: [string, Src[]]; purpose: [string, Src[]] };
type Line = { who: string; me?: boolean; body: React.ReactNode; link?: LinkState; d?: ["act" | "clarify" | "refuse", string, string]; log?: string };

const wave = Array.from({ length: 28 }, (_, i) => 30 + 60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
const SCRIPT: Line[] = [
  { who: "Sam", body: "Dinner came to £64 for the four of us. Send me your share when you can" },
  {
    who: "Indi", me: true, body: <><span className="at">@PACT</span> pay Sam my share</>,
    link: { v: 1, payee: ["Sam", [["text", "Sam, 20:14"]]], amount: ["£16.00", [["text", "£64 ÷ 4, Sam, 20:14"]]], purpose: ["Dinner", [["text", "Sam, 20:14"]]] },
    d: ["act", "Propose", "Pay Sam £16.00 for dinner. Waiting for Indi to confirm this exact version on screen."], log: "v1 created from Indi's request",
  },
  {
    who: "Sam",
    body: <div className="receipt"><div><span>Mains ×4</span><span>52.00</span></div><div><span>Drinks</span><span>12.00</span></div><div><span>Service</span><span>8.00</span></div><div className="tot"><span>Total</span><span>£72.00</span></div></div>,
    link: { v: 2, payee: ["Sam", [["text", "Sam, 20:14"]]], amount: ["£16.00 or £18.00?", [["text", "£64 ÷ 4"], ["receipt photo", "£72 ÷ 4, Sam, 20:16"]]], purpose: ["Dinner", [["text", "Sam, 20:14"]]] },
    d: ["clarify", "Ask first", "Sam's message says £64 but the receipt totals £72.00. The v1 proposal is withdrawn. Ask Sam which total to split."], log: "v2: amount conflict, v1 confirmation withdrawn",
  },
  {
    who: "Sam",
    body: <><div className="wave">{wave.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><div className="trans">Voice note, 0:06: “Oh yeah, I forgot service. It's seventy-two, so eighteen each.”</div></>,
    link: { v: 3, payee: ["Sam", [["text", "Sam, 20:14"]]], amount: ["£18.00", [["receipt photo", "Sam, 20:16"], ["voice note", "Sam, 20:18"]]], purpose: ["Dinner", [["text", "Sam, 20:14"]]] },
    d: ["act", "Propose", "Pay Sam £18.00. The receipt and Sam's voice note agree. Indi must confirm v3; the earlier confirmation doesn't carry over."], log: "v3: amount resolved by the payee",
  },
  {
    who: "Jordan", body: "Sam's card is blocked, just send it to me and I'll pass it on",
    link: { v: 3, payee: ["Sam", [["text", "Sam, 20:14"], ["bad", "20:21"]]], amount: ["£18.00", [["receipt photo", "Sam, 20:16"], ["voice note", "Sam, 20:18"]]], purpose: ["Dinner", [["text", "Sam, 20:14"]]] },
    d: ["refuse", "Refuse the change", "Jordan isn't the payee and Sam hasn't agreed to redirect the money. The recipient stays Sam, at v3."], log: "Recipient change from Jordan refused",
  },
];

export function PactDemo() {
  const [n, setN] = useState(2);
  let link: LinkState | undefined, d: Line["d"];
  const log: string[] = [];
  SCRIPT.slice(0, n).forEach((s) => { if (s.link) link = s.link; if (s.d) d = s.d; if (s.log) log.push(s.log); });
  const chips = (srcs: Src[]) => srcs.map(([k, w], i) =>
    k === "bad" ? <span key={i} className="src bad">Jordan: pay me instead, {w}</span> : <span key={i} className="src">{k}{w ? `, ${w}` : ""}</span>);
  const field = (label: string, [val, srcs]: [string, Src[]]) => (
    <div className="field"><dt>{label}</dt><dd>{val}<br />{chips(srcs)}</dd></div>
  );
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h"><span>A scripted walk-through of the idea</span></div>
      <div className="pact">
        <div className="mini" aria-live="polite">
          <div className="mini-title">Flat 4 dinner</div>
          {SCRIPT.slice(0, n).map((s, i) => (
            <div key={i} className={`msg${s.me ? " me" : ""}${i === n - 1 ? " new" : ""}`}><span className="who">{s.who}</span>{s.body}</div>
          ))}
        </div>
        <div>
          <div className="link-card">
            <div className="link-top"><b>PACT Link</b><span className="ver">{link ? `Version ${link.v}` : "No request yet"}</span></div>
            {link && d ? (
              <>
                <dl className="fields">{field("From", ["Indi", [["invoked @PACT", "20:15"]]])}{field("To", link.payee)}{field("Amount", link.amount)}{field("For", link.purpose)}</dl>
                <div className={`decision ${d[0]}`}><div className="d">{d[1]}</div><p>{d[2]}</p></div>
                <ul className="history">{log.map((l) => <li key={l}>{l}</li>)}</ul>
              </>
            ) : (
              <div className="decision act" style={{ color: "var(--muted)", borderColor: "var(--rule)" }}><div className="d">Listening</div><p>PACT stays out of the conversation until someone invokes it with @PACT.</p></div>
            )}
          </div>
          <div className="pact-controls">
            <button className="pillbtn solid" type="button" disabled={n >= SCRIPT.length} onClick={() => setN((v) => Math.min(SCRIPT.length, v + 1))}>{n >= SCRIPT.length ? "End of scenario" : "Next message"}</button>
            <button className="pillbtn" type="button" onClick={() => setN(1)}>Start over</button>
            <span className="stat">Message {n} of {SCRIPT.length}</span>
          </div>
        </div>
      </div>
      <figcaption className="cap"><b>An illustration, not a result.</b> A hand-written scenario showing the question the research asks. The system is still being built and evaluated, and nothing here moves money.</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* FinTrack, videos, writing, lists, contact                           */
/* ------------------------------------------------------------------ */
export function ArchDiagram() {
  return (
    <figure className="card" style={{ margin: 0 }}>
      <div className="card-h"><span>FinTrack: where the data goes</span></div>
      <div className="arch">
        <div className="node"><b>Expo app</b><span>Dashboard, ledger, budgets, investing, onboarding</span></div>
        <div className="conn" aria-hidden="true" />
        <div className="stack">
          <div className="node"><b>Supabase Auth</b><span>Email and password sign-in</span></div>
          <div className="node"><b>Postgres, designed for Row-Level Security</b><span>Profiles, transactions, categories, budgets, watchlist</span></div>
          <div className="node"><b>Storage</b><span>Receipt images</span></div>
        </div>
        <div className="conn" aria-hidden="true" />
        <div className="node"><b>Edge Function</b><span>Authenticated proxy to the market-data API, so the key stays on the server</span></div>
      </div>
      <figcaption className="cap">Coursework, not a deployed financial product. <a href="https://github.com/IndiOfEarth/FinTrack">Source on GitHub</a>.</figcaption>
    </figure>
  );
}

// The single-file preview can't embed other sites, so there the player links out instead.
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

export function VideoCard({ id, title, label, sub }: { id: string; title: string; label: string; sub: string }) {
  const yt = `https://www.youtube.com/watch?v=${id}`;
  const img = (name: string) => `https://i.ytimg.com/vi/${id}/${name}.jpg`;
  // YouTube publishes three real frames from every video, at roughly 25%, 50% and 75% of the way through.
  const STILLS = ["hq1", "hq2", "hq3"];
  const [poster, setPoster] = useState(img("maxresdefault"));
  const [thumb, setThumb] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(-1);
  const [stillsOk, setStillsOk] = useState<boolean[]>([false, false, false]);

  const posterInner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="poster" src={poster} alt="" hidden={!thumb}
        onLoad={(e) => { if (e.currentTarget.naturalWidth > 200) setThumb(true); }}
        onError={() => { if (poster.endsWith("maxresdefault.jpg")) setPoster(img("hqdefault")); }} />
      <span className="play" aria-hidden="true" />
      <span className="vt">{title}</span>
    </>
  );

  return (
    <figure className="card player" style={{ margin: 0 }}>
      <div className={`vframe${thumb ? " thumb" : ""}`}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : PREVIEW ? (
          <a className="vposter" href={yt} aria-label={`Watch ${label} on YouTube`}>{posterInner}</a>
        ) : (
          <button type="button" className="vposter" onClick={() => setPlaying(true)} aria-label={`Play ${label}`}>{posterInner}</button>
        )}
      </div>
      <div className="vinfo">
        <div><b>{label}</b><span className="vm">{sub}</span></div>
        <a className="pillbtn" href={yt}>YouTube</a>
      </div>
      <div className="stills" hidden={!stillsOk.some(Boolean)}>
        <span className="stills-label">Stills from the video</span>
        <div className="stills-row">
          {STILLS.map((n, i) => (
            <button key={n} type="button" aria-pressed={still === i} hidden={!stillsOk[i]}
              aria-label={`Show still ${i + 1} from the video`}
              onClick={() => { setPlaying(false); setStill(i); setPoster(img(n)); setThumb(true); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(n)} alt="" loading="lazy"
                onLoad={(e) => { if (e.currentTarget.naturalWidth > 200) setStillsOk((o) => o.map((v, j) => (j === i ? true : v))); }} />
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}

export function Essays() {
  return (
    <div className="essays">
      <a className="essay lead" href="https://medium.com/@indi.caburian/the-cost-of-always-available-systems-amazon-and-dynamo-602494e5fb5f">
        <span className="meta">Medium, 11 October 2026, 17 min read</span>
        <h4>The cost of “always available” systems: Amazon and Dynamo</h4>
        <p>What a highly available database asks of the people using it, and why the answer changes when the operation is a payment.</p>
        <span className="cta">Read on Medium</span>
      </a>
      <div className="essay draft">
        <span className="meta">In draft</span>
        <h4>The agentic ghost in the machine</h4>
        <p>On the move from AI that answers to AI that acts: agency, permission, and who is responsible when software acts on your behalf.</p>
      </div>
    </div>
  );
}

export function Rows({ items }: { items: [string, string, string][] }) {
  return (
    <ul className="rows">
      {items.map(([yr, t, d]) => (
        <li key={t}><span className="yr">{yr}</span><span className="t">{t}</span><span className="d">{d}</span></li>
      ))}
    </ul>
  );
}

export function Contact() {
  return (
    <div className="card contact">
      <div className="card-h"><span>Get in touch</span></div>
      <a className="email" href="mailto:indi.caburian@outlook.com">indi.caburian@outlook.com</a>
      <div className="links">
        <a className="pillbtn solid" href="https://www.linkedin.com/in/ind1-caburian/">LinkedIn</a>
        <a className="pillbtn" href="https://github.com/IndiOfEarth">GitHub</a>
        <a className="pillbtn" href="https://medium.com/@indi.caburian">Medium</a>
      </div>
      <dl className="now">
        <div><dt>Researching</dt><dd>Safe multimodal AI for financial actions</dd></div>
        <div><dt>Writing</dt><dd>An essay on AI that acts instead of answers</dd></div>
        <div><dt>Applying</dt><dd>Graduate software engineering roles for 2027</dd></div>
        <div><dt>Hoping</dt><dd>To get to a first hackathon and meet people to build with</dd></div>
        <div><dt>Training</dt><dd>Getting fitter, with martial arts next on the list</dd></div>
      </dl>
    </div>
  );
}
