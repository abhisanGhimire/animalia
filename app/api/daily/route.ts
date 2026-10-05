import { NextRequest, NextResponse } from "next/server";
import { dailyAnimal } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const a = dailyAnimal(new Date(), req.nextUrl.searchParams.get("hideScary") === "true");
  return NextResponse.json(a);
}
