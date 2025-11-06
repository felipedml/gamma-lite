"use client";

import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import TemplatePicker from "@/components/TemplatePicker";
import DensityControl from "@/components/DensityControl";

type GenerateResponse = {
  ok: boolean;
  content?: string;
  error?: string;
};

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [language, setLanguage] = useState<string>("pt-BR");
  const [useResearch, setUseResearch] = useState<boolean>(true);
  const [extraText, setExtraText] = useState<string>("");
  const [slides, setSlides] = useState<number>(10);
  const [template, setTemplate] = useState<string>("clean");
  const [density, setDensity] = useState<"low" | "medium" | "high">("medium");

  const [loading, setLoading] = useState<boolean>(false);
  const [md, setMd] = useState<string>("");

  async function onGenerate() {
    if (!topic.trim()) {
      alert("Informe o tema.");
      return;
    }
    setLoading(true);
    setMd("");

    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          research: useResearch,
          extraText,
          slides,
          template,
          density,
        }),
      });

      const j = (await r.json()) as GenerateResponse;
      setLoading(false);

      if (j?.ok && j.content) {
        setMd(j.content);
      } else {
        alert(j?.error || "Falha ao gerar.");
      }
    } catch (e: any) {
      setLoading(false);
      alert(e?.message || "Erro inesperado ao gerar.");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">
        {process.env.NEXT_PUBLIC_APP_TITLE || "Gamma-lite – Pembroke Collins"}
      </h1>

      {/* Tema */}
      <label className="block mb-2 font-medium">Tema</label>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder='Ex.: "Aula sobre O Cortiço"'
      />

      {/* Linha 2: Idioma / Research */}
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

        <div className="md:col-span-2 flex items-end gap-2">
          <input
            id="research"
            type="checkbox"
            checked={useResearch}
            onChange={(e) => setUseResearch(e.target.checked)}
          />
          <label htmlFor="research">Usar pesquisa (Perplexity)</label>
        </div>
      </div>

      {/* Upload de arquivos para extração */}
      <div className="mb-4">
        <UploadBox
          onExtract={(t) =>
            setExtraText((prev) => (prev ? prev + "\n\n" + t : t))
          }
        />
      </div>

      {/* Texto adicional */}
      <label className="block mb-2 font-medium">Texto adicional (opcional)</label>
      <textarea
        className="w-full border rounded px-3 py-2 mb-4 min-h-[120px]"
        value={extraText}
        onChange={(e) => setExtraText(e.target.value)}
        placeholder="Cole anotações, tópicos ou trechos do material…"
      />

      {/* Linha 3: Slides / Template / Density */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block mb-2 font-medium">Nº de slides</label>
          <input
            type="number"
            min={4}
            max={30}
            value={slides}
            onChange={(e) =>
              setSlides(parseInt((e.target as HTMLInputElement).value, 10) || 0)
            }
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Template</label>
          <TemplatePicker
            value={template}
            onChange={(val) => setTemplate(val)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Densidade</label>
          <DensityControl
            value={density}
            onChange={(val) => setDensity(val)}
          />
        </div>
      </div>

      {/* Botão Gerar */}
      <button
        className="bg-brand-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={onGenerate}
        disabled={!topic || loading}
      >
        {loading ? "Gerando…" : "Gerar apresentação"}
      </button>

      {/* Resultado Markdown */}
      {md && (
        <>
          <hr className="my-8" />
          <h2 className="font-semibold mb-3">Markdown gerado</h2>
          <pre className="whitespace-pre-wrap border rounded p-4 bg-white">
            {md}
          </pre>
        </>
      )}
    </main>
  );
}
