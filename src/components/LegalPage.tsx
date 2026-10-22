import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COMPANY, LEGAL_UPDATED } from '../lib/legal';

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
        <ArrowLeft className="h-4 w-4" /> Terug
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">Laatst bijgewerkt: {LEGAL_UPDATED}</p>
      <p className="mt-4 text-gray-700">{intro}</p>

      <div className="mt-8 space-y-8">
        {sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold text-gray-900">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-gray-700">{s.body}</div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <h2 className="mb-2 font-bold text-gray-900">Contact</h2>
        <p>
          {COMPANY.name}
          {COMPANY.address && <> · {COMPANY.address}</>}
          {COMPANY.kvk && <> · KvK {COMPANY.kvk}</>}
          <br />
          E-mail: <a className="font-semibold text-orange-600 underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </section>
    </main>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
