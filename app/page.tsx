"use client";

import { useState } from "react";
import TemplatePicker from "@/components/TemplatePicker";
import DensityControl from "@/components/DensityControl";

/**
 * Página principal: permite definir tema, idioma, nº de slides, template,
 * densidade de texto e imagens; envia dados para /api/presentation/generate.
 */
export default function Home() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("pt-BR");
  const [slides, setSlides] = useState(8);
  const [template, setTemplate] = useState("clean");
  const [density, setDensity] = useState("balanced");
  const [imageMode, setImageMode] = useState("some");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("topic", topic);
      form.append("lang", lang);
      form.append("slides", String(slides));
      form.append("template", template);
      form.append("density", density);
      form.append("imageMode", imageMode);
      files.forEach((f) => form.append("files", f));
      const res = await fetch("/api/presentation/generate", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.html) {
        const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename || "presentation.html";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert(data.error || "Erro na geração");
      }
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="text-xl font-semibold mb-3">Gerar apresentação</div>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Descreva o tema ou cole seu conteúdo…"
          className="w-full h-32 p-3 rounded-md border border-gray-300 bg-white"
        />
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm block mb-1">Idioma</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Número de slides</label>
            <input
              type="number"
              min="4"
              max="30"
              value={slides}
              onChange={(e) => setSlides(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Arquivos (opcional, até 200 MB)</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-sm font-medium">Templates</div>
        <TemplatePicker value={template} onChange={setTemplate} />
        <DensityControl
          density={density}
          setDensity={setDensity}
          imageMode={imageMode}
          setImageMode={setImageMode}
        />
      </section>

      <div>
        <button
          onClick={generate}
          disabled={loading || !topic}
          className="px-5 py-3 rounded-md bg-[var(--pc-primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Gerando…" : "Gerar apresentação"}
        </button>
      </div>
    </div>
  );
}
