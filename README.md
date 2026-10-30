# Indi Caburian — portfolio

A portfolio told as an AI chat. It opens on a "What would you like to know about Indi?" home screen. As you scroll, the composer docks to the bottom, each question types itself in and sends, and the answer streams in with live figures from the real projects.

Built with Next.js 16 (App Router), React 19 and plain CSS. No other runtime dependencies.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Deploy

Push the folder to a GitHub repo and import it in Vercel, or run `npx vercel` from the folder. To use the domain, add `indicaburian.com` under the project's Domains settings.

## Where things live

| File | What it does |
| --- | --- |
| `components/ChatPortfolio.tsx` | The conversation script (`TURNS`), sidebar, composer and the scroll engine |
| `components/Figures.tsx` | Interactive figures: CIFAKE views, transformation explorer, genetic algorithm, Dynamo, PACT demo and more |
| `components/Stream.tsx` | Paragraphs that stream word by word. Supports `**bold**`, `*italic*` and `[links](url)` |
| `app/globals.css` | All styling. Colour and type tokens are at the top |
| `public/img/` | Images taken from the CIFAKE notebook outputs |

### Editing the conversation

Each entry in `TURNS` has a question `q`, a sidebar `title`, a list of `keys` (words that route a typed question to this answer) and the answer `a`. Put text in `<Stream>` and anything rich in `<Block>`. Give the first `<Stream>` of an answer `delay={90}` so the "Thinking" state shows for a moment.

### Video thumbnails

Video cards try to load the YouTube thumbnail. Where that's blocked, they show a black title card instead.

### Single-file preview

`npm run preview` bundles the whole site into `preview/dist/index.html`, with images inlined, for sharing without a server.
