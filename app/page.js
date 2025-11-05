// app/page.js
"use client";

import { useState } from "react";
import UploadBox from "@/components/UploadBox";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [useResearch, setUseResearch] = useState(true);
  const [extraText, setExtraText] = useState("");
  const [loading, setLoading] = useState(false);
  const [md, setMd] = useState("");

  async function onGenerate() {
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
        }),
      });
      const j = await r.json();
      if (j?.ok) setMd(j.content);
      else alert(j?.error || "Falha ao gerar.");
    } catch (e) {
      console.error(e);
      alert("Erro de rede ao gerar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">
        {process.env.NEXT_PUBLIC_APP_TITLE || "Gamma-lite – Pembroke Collins"}
      </h1>

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

      {/* Upload de arquivos para extrair texto e anexar ao prompt */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Anexar arquivos (opcional)</label>
        <UploadBox
          onExtract={(t) =>
            setExtraText((prev) => (prev ? prev + "\n\n" + t : t))
          }
        />
      </div>

      <label className="block mb-2 font-medium">Texto adicional (opcional)</label>
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
        </>
      )}
    </main>
  );
}
