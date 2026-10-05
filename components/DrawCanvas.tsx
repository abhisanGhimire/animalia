"use client";
import { useEffect, useRef, useState } from "react";
import LessonSVG from "./LessonSVG";
import type { Step } from "@/lib/lessons";

type Tool = "pencil" | "brush" | "eraser" | "line";
const W = 600, H = 400;
const COLORS = ["#1f2a24", "#d9480f", "#0b8f82", "#2f6b4f", "#5b8def", "#c46bd1", "#e9a23b", "#8a5a2b"];

export default function DrawCanvas({ trace }: { trace?: { steps: Step[]; upTo: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [grid, setGrid] = useState(false);
  const [refOpacity, setRefOpacity] = useState(0.35);
  const [showRef, setShowRef] = useState(true);
  const [undo, setUndo] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const lineStart = useRef<{ x: number; y: number; snap: ImageData } | null>(null);

  const ctx = () => ref.current!.getContext("2d")!;
  useEffect(() => { const c = ctx(); c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); }, []);

  const snapshot = () => ref.current!.toDataURL();
  function restore(url: string) {
    const img = new Image();
    img.onload = () => { const c = ctx(); c.clearRect(0, 0, W, H); c.drawImage(img, 0, 0); };
    img.src = url;
  }
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  function style() {
    const c = ctx();
    c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    c.lineWidth = tool === "eraser" ? size * 3 : tool === "brush" ? size * 2 : size;
    c.globalAlpha = tool === "brush" ? 0.6 : 1;
  }
  function down(e: React.PointerEvent) {
    ref.current!.setPointerCapture(e.pointerId);
    setUndo((u) => [...u.slice(-29), snapshot()]); setRedo([]);
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    if (tool === "line") lineStart.current = { ...p, snap: ctx().getImageData(0, 0, W, H) };
    else { style(); const c = ctx(); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 0.01, p.y); c.stroke(); }
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const p = pos(e); const c = ctx(); style();
    if (tool === "line" && lineStart.current) {
      c.putImageData(lineStart.current.snap, 0, 0);
      c.beginPath(); c.moveTo(lineStart.current.x, lineStart.current.y); c.lineTo(p.x, p.y); c.stroke();
    } else {
      c.beginPath(); c.moveTo(last.current!.x, last.current!.y); c.lineTo(p.x, p.y); c.stroke();
      last.current = p;
    }
  }
  function up() { drawing.current = false; lineStart.current = null; ctx().globalAlpha = 1; }

  function doUndo() { const u = [...undo]; const prev = u.pop(); if (!prev) return; setRedo((r) => [...r, snapshot()]); setUndo(u); restore(prev); }
  function doRedo() { const r = [...redo]; const nxt = r.pop(); if (!nxt) return; setUndo((u) => [...u, snapshot()]); setRedo(r); restore(nxt); }
  function clear() { setUndo((u) => [...u, snapshot()]); const c = ctx(); c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); }
  function save() { const a = document.createElement("a"); a.download = "my-animal-drawing.png"; a.href = snapshot(); a.click(); }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing tools">
        {(["pencil", "brush", "line", "eraser"] as Tool[]).map((t) => (
          <button key={t} className="chip" aria-pressed={tool === t} onClick={() => setTool(t)}>{{ pencil: "✏️ Pencil", brush: "🖌️ Brush", line: "📏 Line", eraser: "🧽 Eraser" }[t]}</button>
        ))}
        <span className="mx-1" aria-hidden>|</span>
        {COLORS.map((c) => <button key={c} aria-label={`Colour ${c}`} aria-pressed={color === c} onClick={() => { setColor(c); if (tool === "eraser") setTool("pencil"); }} className="h-7 w-7 rounded-full border-2" style={{ background: c, borderColor: color === c ? "var(--ink)" : "transparent" }} />)}
        <label className="text-sm">Size <input type="range" min={1} max={16} value={size} onChange={(e) => setSize(+e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="chip" onClick={doUndo} disabled={!undo.length}>↩️ Undo</button>
        <button className="chip" onClick={doRedo} disabled={!redo.length}>↪️ Redo</button>
        <button className="chip" onClick={clear}>🗑️ Clear</button>
        <button className="chip" aria-pressed={grid} onClick={() => setGrid(!grid)}>▦ Grid</button>
        {trace && <button className="chip" aria-pressed={showRef} onClick={() => setShowRef(!showRef)}>👻 Trace guide</button>}
        {trace && showRef && <label className="text-sm">Guide strength <input type="range" min={0.1} max={1} step={0.05} value={refOpacity} onChange={(e) => setRefOpacity(+e.target.value)} /></label>}
        <button className="btn ml-auto" onClick={save}>💾 Download</button>
      </div>

      <div className="card relative mx-auto w-full max-w-[600px] overflow-hidden bg-white" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={ref} width={W} height={H} className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Drawing canvas" />
        {/* Overlays are click-through so they never block drawing. */}
        {trace && showRef && <LessonSVG steps={trace.steps} upTo={trace.upTo} label="" fixed opacity={refOpacity} className="pointer-events-none absolute inset-0 h-full w-full" />}
        {grid && <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(#0002 1px,transparent 1px),linear-gradient(90deg,#0002 1px,transparent 1px)", backgroundSize: "10% 12.5%" }} />}
      </div>
    </div>
  );
}
