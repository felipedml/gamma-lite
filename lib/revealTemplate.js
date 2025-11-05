// lib/revealTemplate.ts
type Slide = { html: string };

export function buildRevealHtml(
  slides: Slide[],
  theme: "light" | "dark" = "light"
){
  // Reveal.js via CDN para simplificar
  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Apresentação</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/${theme}.css">
  <style>
    :root{ --pc:#6D6D6D; }
    .statement{ font-size: 48px; line-height:1.1; font-weight:700; }
    .sidebar{ display:grid; grid-template-columns: 28% 1fr; gap:32px; align-items:start; }
    .imageFocus img{ width:100%; height:520px; object-fit:cover; border-radius:10px; }
  </style>
</head>
<body>
<div class="reveal"><div class="slides">
  ${slides.map(s=>`<section>${s.html}</section>`).join("\n")}
</div></div>

<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
<script>Reveal.initialize({ hash:true });</script>
</body></html>`;
}

export function renderSlideByTemplate(
  t: "clean"|"sidebar"|"imageFocus"|"statement",
  title: string,
  bullets: string[],
  imageUrl?: string
): { html: string } {
  if(t==="statement"){
    return { html: `<div class="statement">${title}</div>` };
  }
  if(t==="sidebar"){
    return { html: `<div class="sidebar">
      <aside><h2 style="color:var(--pc)">${title}</h2></aside>
      <ul>${bullets.map(b=>`<li>${b}</li>`).join("")}</ul>
    </div>`};
  }
  if(t==="imageFocus" && imageUrl){
    return { html: `<div class="imageFocus">
      <img src="${imageUrl}" alt="">
      <h2>${title}</h2>
      <ul>${bullets.map(b=>`<li>${b}</li>`).join("")}</ul>
    </div>`};
  }
  // clean (default)
  return { html: `<h2>${title}</h2><ul>${bullets.map(b=>`<li>${b}</li>`).join("")}</ul>`};
}
