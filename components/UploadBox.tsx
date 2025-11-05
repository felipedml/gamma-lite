"use client";
import { useState } from "react";

export default function UploadBox({ onExtract }) {
  const [busy, setBusy] = useState(false);

  async function handleFile(f) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const r = await fetch("/api/extract", {
        method: "POST",
        body: fd,
      });
      const j = await r.json();
      if (j?.ok) {
        onExtract(j.text);
      } else {
        alert(j?.error || "Falha no upload");
      }
    } catch {
      alert("Erro no upload");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-2 border-dashed rounded p-6 bg-white">
      <p className="mb-3 font-medium">Anexar arquivo (PDF, DOCX ou TXT)</p>
      <input
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        disabled={busy}
      />
      {busy && <p className="mt-2 text-sm opacity-70">Processando…</p>}
    </div>
  );
}
