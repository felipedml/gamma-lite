// components/TemplatePicker.tsx
"use client";
type TemplateId = "clean" | "sidebar" | "imageFocus" | "statement";

export const templates: { id: TemplateId; name: string; desc: string }[] = [
  { id: "clean", name: "Clean", desc: "Tipografia forte, foco no conteúdo" },
  { id: "sidebar", name: "Sidebar", desc: "Coluna lateral para tópicos" },
  { id: "imageFocus", name: "Imagem destaque", desc: "Hero com imagem ampla" },
  { id: "statement", name: "Statement", desc: "Slide de tese/manifesto" },
];

export default function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (v: TemplateId) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`card p-3 text-left hover:shadow-soft transition
            ${value === t.id ? "ring-2 ring-pc-primary" : ""}`}
        >
          <div className="font-medium">{t.name}</div>
          <div className="text-sm text-black/60">{t.desc}</div>
        </button>
      ))}
    </div>
  );
}
