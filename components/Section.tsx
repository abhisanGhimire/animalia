export default function Section({ title, emoji, children, open = false }: { title: string; emoji?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="card group p-4">
      <summary className="cursor-pointer list-none text-lg font-bold">
        <span aria-hidden>{emoji} </span>{title}
        <span className="float-right text-muted transition group-open:rotate-180" aria-hidden>▾</span>
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}
