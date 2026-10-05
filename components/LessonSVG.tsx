import type { Shape, Step } from "@/lib/lessons";

function draw(s: Shape, key: string, color: string, width: number) {
  const common = { key, fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (s.t) {
    case "ellipse": return <ellipse {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined} />;
    case "circle": return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    case "path": return <path {...common} d={s.d} />;
    case "dot": return <circle key={key} cx={s.cx} cy={s.cy} r={s.r} fill={color} />;
  }
}

// Shows every step up to `upTo`; the newest step is drawn in the accent colour.
export default function LessonSVG({ steps, upTo, className = "", label, fixed = false, opacity = 1 }: { steps: Step[]; upTo: number; className?: string; label: string; fixed?: boolean; opacity?: number }) {
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label={label} className={className} style={{ opacity }} aria-hidden={label ? undefined : true}>
      {steps.slice(0, upTo + 1).map((st, i) =>
        st.shapes.map((sh, j) => draw(sh, `${i}-${j}`, i === upTo ? (fixed ? "#d9480f" : "var(--brand)") : fixed ? "#1f2a24" : "var(--ink)", i === upTo ? 3.5 : 2.5)),
      )}
    </svg>
  );
}
