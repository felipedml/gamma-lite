// Gera um HTML Reveal.js completo a partir de um array de slides.
// slides = [{ title, bullets: [..], notes? }]
export function buildRevealHTML({ title = 'Apresentação', slides = [], theme = 'black' }) {
  const sanitize = (s='') =>
    String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');

  const sections = slides.map(s => {
    const bullets = (s.bullets || []).map(b => `<li>${sanitize(b)}</li>`).join('');
    const notes = s.notes ? `<aside class="notes">${sanitize(s.notes)}</aside>` : '';
    return `
      <section>
        <h2>${sanitize(s.title || '')}</h2>
        ${bullets ? `<ul>${bullets}</ul>` : ''}
        ${notes}
      </section>
    `;
  }).join('\n');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${sanitize(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/${theme}.css" id="theme">
  <style>
    :root { --r-main-font-size: 34px; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>${sanitize(title)}</h1>
        <p style="font-size:0.55em;color:#7a8897">Gerado por Gamma-lite (OpenAI + Reveal.js)</p>
      </section>
      ${sections}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
  <script>
    const deck = new Reveal({
      hash: true,
      slideNumber: true,
      transition: 'slide'
    });
    deck.initialize();
  </script>
</body>
</html>`;
}
