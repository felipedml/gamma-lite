// app/api/presentation/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai, pplxChat } from "@/lib/providers";
import { buildRevealHtml, renderSlideByTemplate } from "@/lib/revealTemplate";

export const runtime = "nodejs"; // evita Edge limits

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const topic = String(form.get("topic") || "");
  const lang = String(form.get("lang") || "pt-BR");
  const slidesN = Number(form.get("slides") || 8);
  const template = String(form.get("template") || "clean") as any;
  const density = String(form.get("density") || "balanced") as
    "textLight"|"balanced"|"textHeavy";
  const imageMode = String(form.get("imageMode") || "some") as
    "none"|"some"|"many";

  // processar anexos: para simplicidade, vamos extrair somente nomes;
  // em uma próxima etapa, podemos fazer parsing de PDF/Docx.
  const files = form.getAll("files") as File[];
  const fileHints = files.map(f => `arquivo: ${f.name} (${Math.round(f.size/1024)} KB)`);

  // 1) (opcional) contexto via Perplexity — só um exemplo; você pode
  // ativar por parâmetro depois
  const wantResearch = false;
  let research = "";
  if (wantResearch && process.env.PPLX_API_KEY) {
    research = await pplxChat([
      { role: "system", content: "Resuma fontes relevantes em tópicos curtos." },
      { role: "user", content: `Tema: ${topic}. Idioma: ${lang}.` },
    ]);
  }

  // 2) instrução para o GPT-4.1-mini
  const maxBullets =
    density === "textLight" ? 3 :
    density === "balanced" ? 5 : 7;

  const sys = `Você é um gerador de apresentações Reveal.js.
Crie um outline com ${slidesN} slides. Para cada slide, devolva:
- "title": até 8 palavras
- "bullets": até ${maxBullets} itens, objetivos
Idioma: ${lang}.
Se houver "research" ou "fileHints", integre-os de modo sucinto.`;

  const user = `Tema: ${topic}
${research ? `\nPesquisa:\n${research}` : ""}
${fileHints.length ? `\nAnexos:\n${fileHints.join("\n")}` : ""}`;

  const comp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.2,
  });

  const text = comp.choices[0].message?.content ?? "";
  // Esperamos um formato simples. Para robustez, pedimos JSON:
  // tentar parsear; fallback para heurística simples
  let outline: { title: string; bullets: string[] }[] = [];
  try {
    // tenta encontrar bloco JSON
    const jsonStr = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)?.[0] ?? "[]";
    const parsed = JSON.parse(jsonStr);
    outline = Array.isArray(parsed) ? parsed : parsed.slides ?? [];
  } catch {
    // fallback: cria 1 slide com tudo
    outline = [{ title: "Apresentação", bullets: text.split("\n").slice(0, maxBullets) }];
  }

  // 3) gerar imagens se solicitado
  const wantImages = imageMode !== "none";
  const many = imageMode === "many";
  const slidesHtml = [];
  for (let i = 0; i < outline.length; i++) {
    const s = outline[i];
    let imageUrl: string | undefined = undefined;

    if (wantImages && process.env.OPENAI_API_KEY) {
      // gerar imagem só no primeiro (some) ou em vários (many)
      if (many || i === 0) {
        const img = await openai.images.generate({
          model: "gpt-image-1",
          prompt: `Imagem editorial, moderna, tema: ${topic}. Slide: ${s.title}. Paleta cinza elegante.`,
          size: "1024x1024",
        });
        imageUrl = img.data?.[0]?.url;
      }
    }

    const t = (template === "imageFocus" && !imageUrl) ? "clean" : template;
    slidesHtml.push(renderSlideByTemplate(t as any, s.title, s.bullets || [], imageUrl));
  }

  const html = buildRevealHtml(slidesHtml);
  return NextResponse.json({ html, filename: "presentation.html" });
}
