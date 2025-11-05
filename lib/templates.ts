// lib/templates.ts
export type TemplateId = "professional" | "academic" | "minimal" | "visual" | "story";

export type TextDensity = "compact" | "balanced" | "detailed";
export type VisualDensity = "low" | "medium" | "high";

export const TEMPLATES: Record<
  TemplateId,
  { label: string; tone: string; structure: string; revealTheme: string }
> = {
  professional: {
    label: "Professional",
    tone:
      "Tom objetivo, corporativo, termos simples, foco em decisão e próximo passo.",
    structure:
      "Capa, Problema, Análise, Proposta, Plano de Ação, Métricas, Riscos/Mitigação, Encerramento/CTA.",
    revealTheme: "white", // reveja depois no preview Reveal
  },
  academic: {
    label: "Academic",
    tone:
      "Tom acadêmico, precisão terminológica, citações curtas e referências.",
    structure:
      "Capa, Contexto/Estado da Arte, Objetivos, Metodologia, Resultados Esperados, Discussão, Referências, Encerramento.",
    revealTheme: "serif",
  },
  minimal: {
    label: "Minimal",
    tone:
      "Texto conciso, muito espaço negativo, no máximo 3 bullets por slide.",
    structure:
      "Capa, 6–8 seções com mensagens-chave, 1 síntese final.",
    revealTheme: "simple",
  },
  visual: {
    label: "Visual",
    tone:
      "Mais imagens, títulos curtos, bullets de uma linha; metáforas visuais.",
    structure:
      "Capa, 8–12 seções com imagem sugerida por slide, Síntese/CTA.",
    revealTheme: "moon",
  },
  story: {
    label: "Storytelling",
    tone:
      "Narrativa clara, gancho, conflito, virada, resolução; linguagem envolvente porém clara.",
    structure:
      "Capa, Abertura (gancho), Situação, Conflito, Caminhos, Solução, Prova/Exemplos, Fecho/CTA.",
    revealTheme: "night",
  },
};

export function densityGuidance(text: TextDensity, visual: VisualDensity) {
  const textRules =
    text === "compact"
      ? "• Máx. 3 bullets por slide, 6–10 palavras cada; frases telegráficas."
      : text === "detailed"
      ? "• 5–7 bullets por slide, 10–16 palavras cada; incluir breves explicações."
      : "• 3–5 bullets por slide, 8–12 palavras cada.";

  const imageRules =
    visual === "low"
      ? "• Gere poucas sugestões de imagem (somente quando for muito útil)."
      : visual === "high"
      ? "• Gere sugestões de imagem para quase todos os slides."
      : "• Gere sugestões de imagem quando agregarem clareza.";

  return `${textRules}\n${imageRules}`;
}
