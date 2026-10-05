import { NextRequest, NextResponse } from "next/server";
import { suggest } from "@/lib/db";

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const hideScary = req.nextUrl.searchParams.get("hideScary") === "true";
  return NextResponse.json(q.trim().length < 2 ? [] : suggest(q, hideScary));
}
