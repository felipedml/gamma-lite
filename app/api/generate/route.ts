import { NextResponse } from "next/server";
import { generateSlidesWithOpenAI } from "@/lib/providers/openai";
import { researchWithPerplexity } from "@/lib/providers/perplexity";
import { TEMPLATES, densityGuidance, TemplateId, TextDensity, VisualDensity } from "@/lib/templates";
import { renderImagesOnMarkdown } from "@/lib/images"; // ver passo 2

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const {
      topic,
      language = "pt-BR",
      research = false,
      extraText,
      templateId = "professional",
      textDensity = "balanced",
      visualDensity = "medium",
      generateImages = false,      // novo
      maxImages = 8,               // novo (cap)
    }: {
      topic: string;
      language?: string;
      research?: boolean;
      extraText?: string;
      templateId?: TemplateId;
      textDensity?: TextDensity;
      visualDensity?: VisualDensity;
      generateImages?: boolean;
      maxImages?: number;
    } = await req.json();

    const tpl = TEMPLATES[templateId] ?? TEMPLATES.professional;

    let context = "";
    if (research) {
      const r = await researchWithPerplexity(
        `Faça um sumário com fontes (markdown) sobre: ${topic}`
      );
      if (r) context = `\n\n=== CONTEXTO (PPLX) ===\n${r}\n`;
    }

    const density = densityGuidance(textDensity, visualDensity);

    const finalPrompt = [
      `Gere uma apresentação em markdown para Reveal.js.`,
      `Idioma: ${language}`,
      `Estilo/Template: ${tpl.label}.`,
      `Tom: ${tpl.tone}`,
      `Estrutura sugerida: ${tpl.structure}`,
      `Densidade:`,
      density,
      `Regras:` ,
      `- 1 título de capa`,
      `- 7 a 12 seções (##) com bullets (•) claros`,
      `- Quando fizer sentido, insira sugestões visuais entre [imagem: descrição concisa]`,
      `Tema: ${topic}`,
      extraText ? `Material do usuário:\n${extraText}` : "",
      context,
    ]
      .filter(Boolean)
      .join("\n");

    let md = await generateSlidesWithOpenAI(finalPrompt);

    // Se imagens IA estiverem ligadas: gerar e incorporar nos locais [imagem: ...]
    if (generateImages) {
      md = await renderImagesOnMarkdown(md, { maxImages });
    }

    return NextResponse.json({
      ok: true,
      content: md,
      revealTheme: tpl.revealTheme,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
