import { NextResponse } from "next/server";
import { facets } from "@/lib/db";

export function GET() {
  return NextResponse.json(facets());
}
