import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/providers";
import { buildRevealHtml, renderSlideByTemplate } from "@/lib/revealTemplate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cria uma apresentação a partir de um formulário multipart (tema, idioma, nº slides, template, densidade, imagens e arquivos).
 * Gera JSON com slides via OpenAI e monta HTML Reveal.js.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const topic = (form.get("topic") || "").toString();
    const lang = (form.get("lang") || "pt-BR").toString();
    const slidesCount = parseInt(form.get("slides")?.toString() || "8", 10);
    const template = (form.get("template") || "clean").toString();
    const density = (form.get("density") || "balanced").toString();
    const imageMode = (form.get("imageMode") || "some").toString();
    const fileList = form.getAll("files") as File[];

    // Dicas baseadas nos anexos (somente nome e tamanho)
    const fileHints = fileList.map(
      (f) => `arquivo: ${f.name} (${Math.round((f.size ?? 0) / 1024)} KB)`
    );

    const maxBullets =
      density === "textLight"
        ? 3
        : density === "textHeavy"
        ? 7
        : 5;

    const sysPrompt = `Você é um gerador de apresentações Reveal.js.
Crie um roteiro JSON com ${slidesCount} seções (sem contar a capa). 
Para cada seção, forneça "title" e "bullets" (máx. ${maxBullets} bullets).
Idioma: ${lang}.`;

    const userPromptParts: string[] = [`Tema: ${topic}`];
    if (fileHints.length) {
      userPromptParts.push(`Anexos:\n${fileHints.join("\n")}`);
    }
    const userPrompt = userPromptParts.join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    let outline;
    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    try {
      outline = JSON.parse(raw);
    } catch {
      outline = { slides: [] };
    }
    const slides = Array.isArray(outline.slides) ? outline.slides : [];

    // Se precisar de imagens IA, defina wantImages e manyImages.
    const wantImages = imageMode !== "none";
    const manyImages = imageMode === "many";
    const slidesHtml: { html: string }[] = [];
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i] ?? {};
      let imageUrl;
      if (wantImages && openai) {
        if (manyImages || i === 0) {
          const img = await openai.images.generate({
            model: "gpt-image-1",
            prompt: `imagem para slide: ${topic}, título: ${s.title || ""}`,
            size: "1024x1024",
          });
          imageUrl = img.data?.[0]?.url;
        }
      }
      slidesHtml.push(
        renderSlideByTemplate(
          template,
          s.title || "",
          Array.isArray(s.bullets) ? s.bullets : [],
          imageUrl
        )
      );
    }
    const html = buildRevealHtml(slidesHtml, {
      title: topic || "Apresentação",
      theme: "white",
      brandLogoUrl: "/pembroke-collins-logo.png",
    });

    return NextResponse.json({
      html,
      filename: "presentation.html",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro interno" },
      { status: 500 }
    );
  }
}
