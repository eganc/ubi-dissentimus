import Link from "next/link";
import { getAllCruxes } from "@/lib/cruxes";
import { copy } from "@/lib/copy";

export default function CruxIndexPage() {
  const cruxes = getAllCruxes();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{copy.cruxes.indexTitle}</h1>
      <ul className="mt-6 divide-y divide-neutral-200">
        {cruxes.map((crux) => (
          <li key={crux.id}>
            <Link
              href={`/cruxes/${crux.id}`}
              className="flex items-start justify-between gap-4 py-4"
            >
              <span className="text-base text-neutral-900">{crux.title}</span>
              <span className="mt-0.5 shrink-0 rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-600">
                {copy.cruxes.typeLabel[crux.type]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
