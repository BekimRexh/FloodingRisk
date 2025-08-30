import React, { useMemo, useState } from "react";

// Professional mockup of the India Flood Risk Simulator UI
// - Tailwind-based layout
// - No external APIs; purely a visual/interaction mockup
// - Adjustable controls for state, date, rainfall intensity, and window length
// - Readouts: risk gauge, trend sparkline, and map placeholder

const STATES = [
  "Assam",
  "Bihar",
  "Uttar Pradesh",
  "West Bengal",
  "Maharashtra",
  "Kerala",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
  "Karnataka",
  "Andhra Pradesh",
  "Madhya Pradesh",
  "Odisha",
  "Punjab",
  "Haryana",
];

function Gauge({ value }: { value: number }) {
  // value 0-100
  const angle = (value / 100) * 180; // semicircle
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[2/1] rounded-t-full bg-gray-100 overflow-hidden shadow-inner">
        <div
          className="absolute bottom-0 left-1/2 origin-bottom bg-black h-[2px]"
          style={{
            width: "50%",
            transform: `rotate(${angle - 90}deg)`,
          }}
        />
        <div className="absolute inset-x-4 bottom-4 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-3xl font-semibold">{value.toFixed(0)}%</div>
        <div className="text-sm text-gray-500">Predicted flood likelihood</div>
      </div>
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  // simple sparkline using inline SVG
  const max = Math.max(...series, 1);
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-gray-700"
      />
    </svg>
  );
}

export default function FloodRiskSimulator() {
  const [state, setState] = useState("Assam");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [intensity, setIntensity] = useState(120); // mm/day
  const [windowDays, setWindowDays] = useState(7); // days
  const [soil, setSoil] = useState("Clayey");
  const [terrain, setTerrain] = useState("Flat plain");

  // Mock state predisposition score (0-1)
  const predisposition = useMemo(() => {
    const plainy = terrain === "Flat plain" ? 0.25 : terrain === "Undulating" ? 0.15 : 0.05;
    const soily = soil === "Clayey" ? 0.25 : soil === "Loamy" ? 0.15 : 0.08;
    const baseline = ["Assam", "Bihar", "West Bengal", "Uttar Pradesh", "Odisha"].includes(state)
      ? 0.3
      : ["Kerala", "Tamil Nadu", "Karnataka", "Maharashtra"].includes(state)
      ? 0.2
      : 0.12;
    return Math.min(1, baseline + plainy + soily);
  }, [state, soil, terrain]);

  // Simple illustrative risk function (mock):
  // risk ~ sigmoid( a*intensity + b*window + predisposition bias )
  const risk = useMemo(() => {
    const a = 0.012; // intensity weight per mm
    const b = 0.06; // window weight per day
    const x = a * intensity + b * windowDays + 2.5 * predisposition - 1.2; // offset tunes mid-point
    const p = 1 / (1 + Math.exp(-x));
    return Math.max(0, Math.min(1, p)) * 100;
  }, [intensity, windowDays, predisposition]);

  const spark = useMemo(() => {
    // mock 14-day trajectory using slight randomization around risk
    const base = risk / 100;
    return Array.from({ length: 14 }, (_, i) => Math.max(0, Math.min(1, base + Math.sin(i / 3) * 0.05 - i * 0.005)))
      .map((v) => v * 100);
  }, [risk]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="px-6 py-5 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">India Flood Risk Simulator</h1>
          <div className="text-sm text-gray-500">Prototype UI • Mock data</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Controls Panel */}
        <section className="col-span-12 lg:col-span-4">
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border shadow-sm">
              <div className="text-sm font-medium mb-2">State</div>
              <select
                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="mt-4 text-sm font-medium mb-2">Start date</div>
              <input
                type="date"
                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Rainfall intensity (mm/day)</div>
                <div className="text-sm tabular-nums font-semibold">{intensity} mm</div>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                step={5}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-4 mb-2">
                <div className="text-sm font-medium">Window length (days)</div>
                <div className="text-sm tabular-nums font-semibold">{windowDays} days</div>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                step={1}
                value={windowDays}
                onChange={(e) => setWindowDays(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="p-5 rounded-2xl border shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Terrain</div>
                  <select
                    className="w-full rounded-xl border px-3 py-2"
                    value={terrain}
                    onChange={(e) => setTerrain(e.target.value)}
                  >
                    <option>Flat plain</option>
                    <option>Undulating</option>
                    <option>Hilly/Steep</option>
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Soil type</div>
                  <select
                    className="w-full rounded-xl border px-3 py-2"
                    value={soil}
                    onChange={(e) => setSoil(e.target.value)}
                  >
                    <option>Clayey</option>
                    <option>Loamy</option>
                    <option>Sandy</option>
                  </select>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Terrain and soil act as static risk modifiers. This mockup uses a simple heuristic to demo UI behavior.
              </p>
            </div>
          </div>
        </section>

        {/* Visualization Panel */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl border shadow-sm">
            <div className="flex items-start flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">Selected</div>
                <div className="text-lg font-semibold">{state} • {new Date(date).toLocaleDateString()}</div>
              </div>
              <div className="w-full md:w-auto">
                <Gauge value={risk} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border">
                <div className="text-sm font-medium mb-2">14‑day risk trajectory (illustrative)</div>
                <Sparkline series={spark} />
                <div className="mt-2 text-xs text-gray-500">Calculated from current inputs (mock).</div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <div className="text-sm font-medium mb-2">Map preview</div>
                <div className="h-48 rounded-lg border bg-white grid grid-cols-12 grid-rows-6 overflow-hidden">
                  {/* Placeholder map grid */}
                  {[...Array(72)].map((_, i) => (
                    <div key={i} className={`border ${i % 2 ? "bg-gray-100" : "bg-gray-50"}`} />
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">State highlight and district overlays would render here.</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border shadow-sm">
            <div className="text-sm font-medium mb-3">Input summary</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 border">
                <div className="text-gray-500">Rainfall intensity</div>
                <div className="font-semibold">{intensity} mm/day</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
                <div className="text-gray-500">Window length</div>
                <div className="font-semibold">{windowDays} days</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
                <div className="text-gray-500">Terrain</div>
                <div className="font-semibold">{terrain}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
                <div className="text-gray-500">Soil type</div>
                <div className="font-semibold">{soil}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              In production, the risk would be computed by a trained model using historical rainfall, soil moisture, runoff, and flood labels.
            </p>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-10 text-xs text-gray-500">
        This is a design mockup. All numbers are illustrative.
      </footer>
    </div>
  );
}
