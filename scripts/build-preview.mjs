// Builds a single self-contained HTML file of the site (React bundled, images inlined)
// for sharing as a preview. The real site is the Next.js app: `npm run build`.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const img = (name) => `data:image/${name.endsWith(".jpg") ? "jpeg" : "png"};base64,` + readFileSync(join(root, "public/img", name)).toString("base64");

// Swap the asset module for one with inlined images.
const range = (n) => Array.from({ length: n }, (_, i) => i);
const previewAssets = `export const ASSETS = ${JSON.stringify({
  realAsAi: range(6).map((i) => img(`real_as_ai_${i}.png`)),
  aiAsReal: range(6).map((i) => img(`ai_as_real_${i}.png`)),
  heroCar: img("real_as_ai_1.png"),
  transforms: img("cifake-transforms.png"),
  grid: img("grid.png"),
  photo: img("indi.jpg"),
  photoSquare: img("indi-square.jpg"),
})};`;

const result = await build({
  entryPoints: [join(root, "preview/entry.tsx")],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  jsx: "automatic",
  target: "es2020",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_PREVIEW": '"1"' },
  logLevel: "error",
  plugins: [{
    name: "preview-assets",
    setup(b) {
      b.onResolve({ filter: /^@\/lib\/assets$/ }, () => ({ path: "assets", namespace: "preview-assets" }));
      b.onLoad({ filter: /.*/, namespace: "preview-assets" }, () => ({ contents: previewAssets, loader: "ts" }));
      b.onResolve({ filter: /^@\// }, (a) => {
        const base = join(root, a.path.slice(2));
        const hit = [base, base + ".tsx", base + ".ts"].find((f) => /\.tsx?$/.test(f) && existsSync(f));
        return { path: hit ?? base };
      });
    },
  }],
});

const css = readFileSync(join(root, "app/globals.css"), "utf8");
const js = result.outputFiles[0].text.replace(/<\/script/g, "<\\/script");
const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Indi Caburian</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;
mkdirSync(join(root, "preview/dist"), { recursive: true });
writeFileSync(join(root, "preview/dist/index.html"), html);
console.log(`preview/dist/index.html ${(html.length / 1024).toFixed(0)} KB`);
