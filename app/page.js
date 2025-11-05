"use client";
import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [useResearch, setUseResearch] = useState(true);
  const [extraText, setExtraText] = useState("");

  const [templateId, setTemplateId] = useState<keyof typeof TEMPLATES>("professional");
  const [textDensity, setTextDensity] = useState<"compact" | "balanced" | "detailed">("balanced");
  const [visualDensity, setVisualDensity] = useState<"low" | "medium" | "high">("medium");
  const [generateImages, setGenerateImages] = useState(true);
  const [maxImages, setMaxImages] = useState(8);

  const [loading, setLoading] = useState(false);
  const [md, setMd] = useState("");
  const [theme, setTheme] = useState<string>("white");

  async function onGenerate() {
    setLoading(true);
    setMd("");
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        language,
        research: useResearch,
        extraText,
        templateId,
        textDensity,
        visualDensity,
        generateImages,
        maxImages,
      }),
    });
    const j = await r.json();
    setLoading(false);
    if (j?.ok) {
      setMd(j.content);
      setTheme(j.revealTheme);
    } else {
      alert(j?.error || "Falha ao gerar.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <img src="/pembroke-collins.png" alt="Pembroke Collins" className="h-8" />
        <h1 className="text-2xl font-semibold">Gamma-lite — Pembroke Collins</h1>
      </div>

      <label className="block mb-2 font-medium">Tema</label>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder='Ex.: "Aula sobre O Cortiço"'
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block mb-2 font-medium">Idioma</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="pt-BR">Português (BR)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Template</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as any)}
          >
            {Object.entries(TEMPLATES).map(([id, t]) => (
              <option key={id} value={id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <input
            id="research"
            type="checkbox"
            checked={useResearch}
            onChange={(e) => setUseResearch(e.target.checked)}
          />
          <label htmlFor="research">Usar pesquisa (Perplexity)</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block mb-2 font-medium">Densidade de texto</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={textDensity}
            onChange={(e) => setTextDensity(e.target.value as any)}
          >
            <option value="compact">Compacta</option>
            <option value="balanced">Balanceada</option>
            <option value="detailed">Detalhada</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Densidade visual</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={visualDensity}
            onChange={(e) => setVisualDensity(e.target.value as any)}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <input
            id="genimg"
            type="checkbox"
            checked={generateImages}
            onChange={(e) => setGenerateImages(e.target.checked)}
          />
          <label htmlFor="genimg">Gerar imagens IA</label>
          <input
            type="number"
            min={1}
            max={20}
            className="w-20 border rounded px-2 py-1"
            value={maxImages}
            onChange={(e) => setMaxImages(Number(e.target.value))}
            title="Máx. imagens"
          />
        </div>
      </div>

      <UploadBox onExtract={(t) => setExtraText((p) => (p ? p + "\n\n" + t : t))} />

      <label className="block mt-6 mb-2 font-medium">Texto adicional (opcional)</label>
      <textarea
        className="w-full border rounded px-3 py-2 mb-4 min-h-[120px]"
        value={extraText}
        onChange={(e) => setExtraText(e.target.value)}
        placeholder="Cole anotações, tópicos ou trechos do material…"
      />

      <button
        className="bg-brand-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={onGenerate}
        disabled={!topic || loading}
      >
        {loading ? "Gerando…" : "Gerar apresentação"}
      </button>

      {md && (
        <>
          <hr className="my-8" />
          <h2 className="font-semibold mb-3">Markdown gerado</h2>
          <pre className="whitespace-pre-wrap border rounded p-4 bg-white">
            {md}
          </pre>

          <p className="mt-4 text-sm opacity-70">
            Tema Reveal sugerido: <code>{theme}</code> (usado no preview).
          </p>
        </>
      )}
    </main>
  );
}
