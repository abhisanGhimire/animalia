import { NextResponse } from "next/server";
import { getAnimal } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const animal = getAnimal(slug);
  if (!animal) return NextResponse.json({ error: "Animal not found" }, { status: 404 });
  return NextResponse.json(animal);
}
