import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CruxBody } from "@/components/CruxBody";
import { getCruxById } from "@/lib/cruxes";
import { getAllExamples, getExampleById } from "@/lib/examples";
import { copy } from "@/lib/copy";

export function generateStaticParams() {
  return getAllExamples().map((example) => ({ id: example.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const example = getExampleById(id);
  if (!example) return {};
  return { title: `${example.title} · ${copy.site.title}`, description: example.summary };
}

export default async function WorkedExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const example = getExampleById(id);

  if (!example) {
    notFound();
  }

  const crux = example.cruxId ? getCruxById(example.cruxId) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-neutral-600 underline">
        {copy.examples.backLink}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">{example.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{example.summary}</p>

      <div className="mt-6">
        <CruxBody blocks={example.body} />
      </div>

      {crux && (
        <p className="mt-10 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
          {copy.examples.relatedCrux}:{" "}
          <Link href={`/cruxes/${crux.id}`} className="text-neutral-900 underline">
            {crux.title}
          </Link>
        </p>
      )}
    </main>
  );
}
