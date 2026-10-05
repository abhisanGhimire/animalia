import { STATUS } from "@/data/reference";
import type { ConservationCode } from "@/lib/types";

export default function StatusBadge({ code, kid = false }: { code: ConservationCode; kid?: boolean }) {
  const s = STATUS[code];
  return (
    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: s.color }} title={s.label}>
      {kid ? s.kid : s.label}
    </span>
  );
}
