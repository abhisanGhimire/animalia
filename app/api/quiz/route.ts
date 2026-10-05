import { NextRequest, NextResponse } from "next/server";
import { quiz } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  return NextResponse.json(quiz(Number(p.get("n") ?? 6) || 6, p.get("hideScary") === "true"));
}
