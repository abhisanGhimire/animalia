import { NextRequest, NextResponse } from "next/server";
import { surprise, toSummary, type SurpriseCategory } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const a = surprise((p.get("category") as SurpriseCategory) ?? "any", p.get("hideScary") === "true");
  return NextResponse.json(toSummary(a));
}
