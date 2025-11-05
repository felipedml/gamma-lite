// lib/revealTemplate.ts
export type Slide = { title?: string; bullets?: string[]; html?: string };

export function buildRevealHtml(opts: {
  deckTitle: string;
  slides: Slide[];
}) {
  const { deckTitle, slides } = opts;

  const sections = slides
    .map((s) => {
      if (s.html) {
        return `<section>${s.html}</section>`;
      }
      const title = s.title ? `<h2>${escapeHtml(s.title)}</h2>` : "";
      const bullets = (s.bullets ?? [])
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("");
      const ul = bullets ? `<ul>${bullets}</ul>` : "";
      return `<section>${title}${ul}</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(deckTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Reveal.js (CDN) -->
  <link rel="stylesheet" href="https://unpkg.com/reveal.js@5/dist/reveal.css">
  <link rel="stylesheet" href="https://unpkg.com/reveal.js@5/dist/theme/black.css" id="theme">
  <style>
    .reveal h1, .reveal h2, .reveal h3 { margin-bottom: .6rem }
    .reveal ul { font-size: 0.95em; line-height: 1.35 }
    .reveal section { text-align: left }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>${escapeHtml(deckTitle)}</h1>
        <p>Gerado com Gamma-Lite</p>
      </section>
      ${sections}
    </div>
  </div>

  <script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
  <script>
    const deck = new Reveal({
      hash: true,
      slideNumber: true,
      transition: 'fade'
    });
    deck.initialize();
  </script>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
