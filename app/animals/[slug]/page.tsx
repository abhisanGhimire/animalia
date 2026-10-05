import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AnimalProfile from "@/components/AnimalProfile";
import { allSlugs, getAnimal, similarTo } from "@/lib/db";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getAnimal((await params).slug);
  return { title: a ? `${a.commonName} | Animalia` : "Animal not found" };
}

export default async function AnimalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const animal = getAnimal(slug);
  if (!animal) notFound();
  return <AnimalProfile animal={animal} similar={similarTo(slug, false, 8)} />;
}
