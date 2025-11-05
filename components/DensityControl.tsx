// components/DensityControl.tsx
"use client";
export type Density = "textLight" | "balanced" | "textHeavy";
export type ImageMode = "none" | "some" | "many"; // usaremos para acionar geração de imagens

export default function DensityControl({
  density,
  setDensity,
  imageMode,
  setImageMode,
}: {
  density: Density;
  setDensity: (d: Density) => void;
  imageMode: ImageMode;
  setImageMode: (m: ImageMode) => void;
}) {
  return (
    <div className="card p-4 grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm mb-2 font-medium">Quantidade de texto</div>
        <div className="flex gap-2">
          {(["textLight","balanced","textHeavy"] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-3 py-2 rounded-md border
                ${density===d ? "bg-pc-primary text-white border-pc-primary"
                               : "bg-white hover:bg-black/5 border-black/10"}`}
            >
              {d==="textLight"?"Menos":d==="balanced"?"Equilibrado":"Mais"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm mb-2 font-medium">Imagens IA</div>
        <div className="flex gap-2">
          {(["none","some","many"] as ImageMode[]).map(m => (
            <button
              key={m}
              onClick={() => setImageMode(m)}
              className={`px-3 py-2 rounded-md border
                ${imageMode===m ? "bg-pc-primary text-white border-pc-primary"
                                 : "bg-white hover:bg-black/5 border-black/10"}`}
            >
              {m==="none"?"Sem":"Com"} {m==="many"?"(muitas)":"(algumas)"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
