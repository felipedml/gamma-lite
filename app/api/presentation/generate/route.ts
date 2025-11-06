// app/api/presentation/generate/route.ts
import { NextResponse } from "next/server";

// Importa o builder de HTML Reveal e o renderizador de imagens
import buildRevealHtml from "../../../../lib/revealTemplate";
import { renderImagesOnMarkdown } from "../../../../lib/images";

export const runtime = "nodejs";

type Slide = { html: string };

type Body = {
  title?: string;
  theme?: string;
  brandLogoUrl?: string;
  // opção 1: você manda os slides prontos (html)
  slides?: Slide[];
  // opção 2: você manda um markdown e eu separo por --- em slides
  md?: string;
};

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Conversor MUITO simples de markdown de lista/títulos para HTML
function mdChunkToHtml(md: string) {
  const safe = escapeHtml(md.trim());

  // títulos de 1 e 2 níveis
  let out = safe
    .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");

  // listas com "-"
  out = out.replace(/^(?:-|\*)\s+(.*)$/gm, "<li>$1</li>");
  out = out.replace(/(<li>.*<\/li>)(\s*(<li>.*<\/li>))+?/gms, (m) => `<ul>${m}</ul>`);

  // quebras de linha restantes
  out = out.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>");
  // envolve em <p> se não começar com bloco
  if (!/^<(h1|h2|h3|ul|ol|p)/.test(out)) out = `<p>${out}</p>`;
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const title = body.title || "Apresentação";
    const theme = body.theme || "black";
    const brandLogoUrl = body.brandLogoUrl || "";

    let slides: Slide[] = [];

    if (Array.isArray(body.slides) && body.slides.length > 0) {
      // já veio pronto
      slides = body.slides.map((s) => ({ html: s?.html || "" }));
    } else if (body.md && body.md.trim()) {
      // processa imagens inline [imagem: ...]
      const mdWithImages = await renderImagesOnMarkdown(body.md);

      // separa por --- (linha isolada) em slides
      const parts = mdWithImages.split(/\n-{3,}\n/g);
      slides = parts.map((chunk) => ({ html: mdChunkToHtml(chunk) }));
    } else {
      return NextResponse.json(
        { ok: false, error: "Envie 'slides' (html) ou 'md' (markdown)." },
        { status: 400 }
      );
    }

    const html = buildRevealHtml(slides, { title, theme, brandLogoUrl });
    return NextResponse.json({ ok: true, html });
  } catch (e: any) {
    console.error("presentation/generate error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao gerar HTML da apresentação." },
      { status: 500 }
    );
  }
}
