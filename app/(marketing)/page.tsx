import Link from "next/link";
import { getAllExamples } from "@/lib/examples";
import { copy } from "@/lib/copy";

export default function LandingPage() {
  const [firstExample] = getAllExamples();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">{copy.landing.h1}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">{copy.landing.sub}</p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {copy.landing.howItWorksTitle}
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-800">
        {copy.landing.howItWorks.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-3 text-[15px]">
        {firstExample && (
          <Link href={`/examples/${firstExample.id}`} className="text-neutral-900 underline">
            {copy.landing.exampleLink}
          </Link>
        )}
        <Link href="/cruxes" className="text-neutral-600 underline">
          {copy.landing.cruxesLink}
        </Link>
      </div>
    </main>
  );
}
