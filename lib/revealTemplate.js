// lib/revealTemplate.js
// Gera um HTML Reveal.js a partir de um array de slides { html: string }

export function buildRevealHtml(
  slides,
  opts = {}
) {
  const {
    title = "Apresentação",
    theme = "black", // temas Reveal: beige, black, blood, league, moon, night, serif, simple, sky, solarized, white
    brandLogoUrl = "", // se quiser exibir sua logo no canto
  } = opts;

  const sections = Array.isArray(slides)
    ? slides.map((s, i) => `<section data-index="${i}">${s && s.html ? s.html : ""}</section>`).join("\n")
    : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Reveal.js CSS via CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.5/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.5/dist/theme/${theme}.css" id="theme">

    <style>
      .reveal .slides section {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .pc-brand {
        position: fixed;
        right: 16px;
        bottom: 16px;
        opacity: 0.85;
        z-index: 20;
      }
      .pc-brand img { height: 40px; }
      .reveal p { line-height: 1.4; }
      .reveal h1, .reveal h2, .reveal h3 { line-height: 1.15; }
    </style>
  </head>
  <body>
    ${brandLogoUrl ? `<div class="pc-brand"><img src="${escapeAttr(brandLogoUrl)}" alt="brand"></div>` : ""}

    <div class="reveal">
      <div class="slides">
        ${sections}
      </div>
    </div>

    <!-- Reveal.js JS via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.5/dist/reveal.js"></script>
    <script>
      const deck = new Reveal({
        hash: true,
        slideNumber: true,
        progress: true,
        transition: 'slide'
      });
      deck.initialize();
    </script>
  </body>
</html>`;
}

// Helpers simples para evitar injeção acidental
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(str) {
  return escapeHtml(str);
}

export default buildRevealHtml;
