// app/page.tsx
"use client";
import { useState } from "react";
import TemplatePicker, { templates } from "@/components/TemplatePicker";
import DensityControl, { Density, ImageMode } from "@/components/DensityControl";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState<"pt-BR"|"en-US">("pt-BR");
  const [slides, setSlides] = useState(8);
  const [template, setTemplate] = useState<"clean"|"sidebar"|"imageFocus"|"statement">("clean");
  const [density, setDensity] = useState<Density>("balanced");
  const [imageMode, setImageMode] = useState<ImageMode>("some");
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
      files.forEach(f => form.append("files", f));

      const res = await fetch("/api/presentation/generate", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Falha ao gerar");
      const { html, filename } = await res.json();

      // baixa o HTML (Reveal.js embutido)
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "presentation.html";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e:any) {
      alert(e.message ?? "Erro");
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
          onChange={(e)=>setTopic(e.target.value)}
          placeholder="Descreva o tema ou cole seu conteúdo…"
          className="w-full h-32 p-3 rounded-md border border-black/10 bg-white"
        />
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm block mb-1">Idioma</label>
            <select value={lang} onChange={(e)=>setLang(e.target.value as any)} className="w-full border rounded-md p-2">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Número de slides</label>
            <input type="number" min={4} max={30} value={slides}
              onChange={(e)=>setSlides(Number(e.target.value))}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Arquivos (opcional, até 200 MB)</label>
            <input
              type="file"
              multiple
              onChange={(e)=>setFiles(Array.from(e.target.files||[]))}
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

      <div className="flex gap-3">
        <button
          onClick={generate}
          disabled={loading || !topic}
          className="px-5 py-3 rounded-md bg-pc-primary text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Gerando…" : "Gerar apresentação"}
        </button>
      </div>

      <p className="text-sm text-black/50">
        Conteúdo: OpenAI (gpt-4.1-mini). Pesquisa opcional: Perplexity Sonar.
        Imagens IA: OpenAI Images quando selecionado.
      </p>
    </div>
  );
}
