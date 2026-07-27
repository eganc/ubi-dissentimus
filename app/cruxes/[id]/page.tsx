import Link from "next/link";
import { notFound } from "next/navigation";
import { CruxBody } from "@/components/CruxBody";
import { getAllCruxes, getCruxById } from "@/lib/cruxes";
import { copy } from "@/lib/copy";

export function generateStaticParams() {
  return getAllCruxes().map((crux) => ({ id: crux.id }));
}

export default async function CruxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crux = getCruxById(id);

  if (!crux) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/cruxes" className="text-sm text-neutral-600 underline">
        {copy.cruxes.backLink}
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">{crux.title}</h1>
        <span className="w-fit shrink-0 rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-600">
          {copy.cruxes.typeLabel[crux.type]}
        </span>
      </div>

      {crux.surfacesAs.length > 0 && (
        <p className="mt-2 text-sm text-neutral-500">{crux.surfacesAs.join(" · ")}</p>
      )}

      <div className="mt-6">
        <CruxBody blocks={crux.body} />
      </div>
    </main>
  );
}
