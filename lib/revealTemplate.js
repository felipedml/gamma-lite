// lib/revealTemplate.js
// Gera HTML Reveal.js a partir de um array de slides { html: string }
export function buildRevealHtml(slides, opts = {}) {
  const { title = "Apresentação", theme = "black", brandLogoUrl = "" } = opts;
  const sections = Array.isArray(slides)
    ? slides
        .map(
          (s, i) =>
            `<section data-index="${i}">${s && s.html ? s.html : ""}</section>`
        )
        .join("\n")
    : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/${theme}.css" id="theme">
    <style>
      .reveal .slides section { display:flex; flex-direction:column; justify-content:center; padding:24px; }
      .pc-brand { position:fixed; right:16px; bottom:16px; opacity:.85; z-index:20; }
      .pc-brand img { height:40px; }
      .reveal p { line-height:1.4; }
      .reveal h1, .reveal h2, .reveal h3 { line-height:1.15; }
      .statement { font-size:48px; line-height:1.1; font-weight:700; }
      .sidebar { display:grid; grid-template-columns:28% 1fr; gap:32px; align-items:start; }
      .imageFocus img { width:100%; height:520px; object-fit:cover; border-radius:10px; }
    </style>
  </head>
  <body>
    ${brandLogoUrl ? `<div class="pc-brand"><img src="${escapeAttr(brandLogoUrl)}" alt="brand"></div>` : ""}
    <div class="reveal"><div class="slides">${sections}</div></div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
    <script>
      const deck = new Reveal({ hash:true, slideNumber:true, progress:true, transition:'slide' });
      deck.initialize();
    </script>
  </body>
</html>`;
}

export function renderSlideByTemplate(template, title, bullets = [], imageUrl) {
  if (template === "statement") {
    return { html: `<div class="statement">${escapeHtml(title)}</div>` };
  }
  if (template === "sidebar") {
    return {
      html: `<div class="sidebar">
        <aside><h2 style="color: var(--pc-primary)">${escapeHtml(title)}</h2></aside>
        <ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      </div>`
    };
  }
  if (template === "imageFocus" && imageUrl) {
    return {
      html: `<div class="imageFocus">
        <img src="${escapeAttr(imageUrl)}" alt="" />
        <h2>${escapeHtml(title)}</h2>
        <ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      </div>`
    };
  }
  return {
    html: `<h2>${escapeHtml(title)}</h2><ul>${bullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("")}</ul>`
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(str) {
  return escapeHtml(str);
}
export default buildRevealHtml;
