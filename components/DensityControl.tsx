"use client";

export default function DensityControl({
  density,
  setDensity,
  imageMode,
  setImageMode,
}) {
  return (
    <div className="card p-4 grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm mb-2 font-medium">Quantidade de texto</div>
        <div className="flex gap-2">
          {["textLight", "balanced", "textHeavy"].map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-3 py-2 rounded-md border ${
                density === d
                  ? "bg-[var(--pc-primary)] text-white border-[var(--pc-primary)]"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
            >
              {d === "textLight"
                ? "Menos"
                : d === "balanced"
                ? "Equilibrado"
                : "Mais"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm mb-2 font-medium">Imagens IA</div>
        <div className="flex gap-2">
          {["none", "some", "many"].map((m) => (
            <button
              key={m}
              onClick={() => setImageMode(m)}
              className={`px-3 py-2 rounded-md border ${
                imageMode === m
                  ? "bg-[var(--pc-primary)] text-white border-[var(--pc-primary)]"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
            >
              {m === "none"
                ? "Sem"
                : m === "some"
                ? "Algumas"
                : "Muitas"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
