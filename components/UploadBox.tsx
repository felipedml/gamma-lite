"use client";
import { useState } from "react";

export default function UploadBox({ onExtract }: { onExtract: (t: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function handleFile(f: File) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", f);

    const r = await fetch("/api/extract", { method: "POST", body: fd });
    const j = await r.json();
    setBusy(false);
    if (j?.ok) onExtract(j.text as string);
    else alert(j?.error || "Falha no upload");
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
