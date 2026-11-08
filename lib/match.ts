// Matches a typed question to the best answer about Indi. No AI: just words.
// Each topic lists words and phrases people are likely to use. Single words score 2,
// phrases score 3, and near-misses (typos) score 1.5. The best topic wins; on a tie the
// earlier topic wins, so the specific topics come first and the generic ones last.

export type Topic = { id: string; words: string[]; phrases?: string[] };

export const TOPICS: Topic[] = [
  { id: "hire", words: ["hire", "hiring", "strength", "strengths", "standout"], phrases: ["why should i hire", "should i hire", "why hire", "good at", "best at", "why indi", "what makes"] },
  { id: "education", words: ["degree", "university", "uni", "goldsmiths", "grade", "grades", "first", "gpa", "marks", "mark", "study", "studying", "student", "course", "qualification", "qualifications", "school", "college", "education", "graduate", "graduation", "level", "levels"], phrases: ["a levels", "a level", "computer science"] },
  { id: "skills", words: ["language", "languages", "python", "typescript", "javascript", "java", "c++", "cpp", "sql", "stack", "tech", "technologies", "skills", "skill", "tools", "framework", "frameworks", "react", "nextjs", "node", "docker", "tensorflow", "keras", "postgres", "postgresql", "supabase", "git", "code", "coding", "program", "programming"], phrases: ["tech stack", "next js", "what can indi do"] },
  { id: "cifake", words: ["cifake", "detector", "detection", "detect", "fake", "fakes", "neural", "network", "networks", "ml", "machine", "learning", "deep", "accuracy", "classifier", "stable", "diffusion", "dataset", "images", "image", "coolest", "interesting", "impressive", "proud"], phrases: ["machine learning", "ai image", "ai images", "ai generated", "deep learning", "most interesting", "best project", "favourite project", "favorite project", "biggest project"] },
  { id: "looking", words: ["robust", "robustness", "transformation", "transformations", "jpeg", "noise", "greyscale", "grayscale", "colour", "color", "finding", "findings", "result", "results", "learned", "mistakes", "hypothesis"], phrases: ["what did it learn", "what was it looking at", "what did the model"] },
  { id: "pact", words: ["pact", "research", "dissertation", "proposal", "agent", "agents", "agentic", "payment", "payments", "money", "fintech", "multimodal", "safety", "verification", "consent", "permission", "fraud", "scam", "scams"], phrases: ["final year", "final project", "working on", "right now", "currently doing", "current project"] },
  { id: "fintrack", words: ["fintrack", "app", "apps", "mobile", "native", "finance", "budget", "budgets", "budgeting", "spending", "expo", "ship", "shipped", "software"], phrases: ["react native", "real software", "personal finance"] },
  { id: "creatures", words: ["creature", "creatures", "genetic", "evolution", "evolve", "evolved", "evolving", "mountain", "climb", "climbing", "pybullet", "simulation", "physics", "ga"], phrases: ["genetic algorithm", "genetic algorithms"] },
  { id: "writing", words: ["write", "writes", "writing", "essay", "essays", "blog", "medium", "article", "articles", "dynamo", "amazon", "distributed", "availability"], phrases: ["system design", "systems design"] },
  { id: "experience", words: ["experience", "worked", "work", "tesco", "retail", "manager", "management", "managing", "leadership", "lead", "team", "teams", "career", "employment", "shop"], phrases: ["work experience", "day job"] },
  { id: "available", words: ["available", "availability", "open", "role", "roles", "internship", "internships", "position", "positions", "start", "starting", "employ"], phrases: ["open to work", "looking for", "job search", "graduate role", "graduate scheme", "when can"] },
  { id: "contact", words: ["contact", "email", "mail", "reach", "linkedin", "github", "cv", "resume", "phone", "message", "socials", "connect"], phrases: ["get in touch", "talk to", "speak to", "how do i reach"] },
  { id: "location", words: ["where", "based", "live", "lives", "location", "essex", "london", "uk", "england", "britain", "country", "city", "relocate", "relocation", "remote"], phrases: ["where is indi", "based in"] },
  { id: "reading", words: ["read", "reads", "reading", "papers", "paper", "books", "book", "learn", "learning", "learns"], phrases: ["reading list", "read for fun"] },
  { id: "videos", words: ["video", "videos", "youtube", "watch", "demo", "demos", "netflix", "nad", "accessibility"], phrases: ["nad v netflix"] },
  { id: "hobbies", words: ["hobby", "hobbies", "interests", "gym", "fitness", "martial", "arts", "hackathon", "hackathons", "weekend", "weekends", "personal"], phrases: ["free time", "spare time", "outside of", "for fun", "fun fact", "fun facts"] },
  { id: "motivation", words: ["why", "motivation", "motivated", "passion", "passionate", "love", "drive", "driven", "inspire", "inspired"], phrases: ["why computer science", "what drives"] },
  { id: "goals", words: ["goal", "goals", "future", "plan", "plans", "next", "masters", "postgraduate", "phd", "ambition", "ambitions", "dream", "aim", "aims", "startup", "company", "founder"], phrases: ["master's", "long term", "five years", "where do you see"] },
  { id: "greeting", words: ["hi", "hello", "hey", "hiya", "yo", "sup", "howdy", "morning", "afternoon", "evening"], phrases: ["good morning", "whats up", "how are you"] },
  { id: "thanks", words: ["thanks", "thank", "cheers", "ta", "appreciate", "ty", "thx"], phrases: ["thank you"] },
  { id: "bot", words: ["bot", "chatgpt", "claude", "llm", "gpt", "robot", "human", "real"], phrases: ["are you ai", "are you an ai", "are you real", "who are you", "what are you exactly", "how does this work", "how was this built", "this site", "this website", "built this site", "made this"] },
  { id: "who", words: ["who", "about", "introduce", "introduction", "summary", "overview", "yourself", "bio"], phrases: ["who is indi", "about indi", "who are they", "about yourself"] },
];

const norm = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

const stem = (w: string) =>
  w.length > 6 && w.endsWith("ing") ? w.slice(0, -3)
    : w.length > 5 && w.endsWith("ed") ? w.slice(0, -2)
      : w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1)
        : w;

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export type Match = { id: string; score: number } | null;

export function matchQuestion(question: string): Match {
  const q = norm(question);
  if (!q) return null;
  const tokens = q.split(" ");
  const stems = tokens.map(stem);
  const padded = ` ${q} `;
  let best: Match = null;
  for (const t of TOPICS) {
    let score = 0;
    for (const p of t.phrases ?? []) if (padded.includes(` ${norm(p)} `)) score += 3;
    const used = new Set<number>();
    for (const w of t.words) {
      const nw = norm(w), sw = stem(nw);
      const exact = stems.findIndex((s, i) => !used.has(i) && (s === sw || tokens[i] === nw));
      if (exact >= 0) { used.add(exact); score += 2; continue; }
      if (nw.length >= 5) {
        const max = nw.length >= 9 ? 2 : 1;
        const near = tokens.findIndex((tk, i) => !used.has(i) && tk.length >= 4 && lev(tk, nw, max) <= max);
        if (near >= 0) { used.add(near); score += 1.5; }
      }
    }
    if (score > (best?.score ?? 0)) best = { id: t.id, score };
  }
  return best && best.score >= 1.5 ? best : null;
}
