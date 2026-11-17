'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function NyhetArticlePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">OpenAI</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                OpenAI lanserar ny API-uppdatering med GPT-4o och lägre priser
              </h1>
              <p className="mt-4 text-slate-300 max-w-2xl">
                OpenAI presenterar GPT-4o i API:t, snabbare och mer kapabel modell med betydligt lägre priser.
              </p>
              <div className="mt-4 text-sm text-slate-400">20 maj 2024 • 3 min läsning</div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Article body */}
          <article className="lg:col-span-2 prose prose-slate max-w-none">
            <p>
              OpenAI har idag annonserat en betydande uppgradering av sitt API. Den nya flaggskeppsmodellen GPT-4o är nu tillgänglig för alla API-användare och ersätter inte bara GPT-4 Turbo i prestanda – den gör det till ett lägre pris.
            </p>

            <h2>Vad är GPT-4o?</h2>
            <p>
              GPT-4o är OpenAI:s mest avancerade modell hittills och hanterar text, bild, ljud och video i realtid. Modellen är snabbare, mer kostnadseffektiv och har starkare multimodal kapacitet.
            </p>

            <h2>De viktigaste förändringarna</h2>
            <ul>
              <li>Lägre priser: Textinmatning är 50% billigare och output 33% billigare jämfört med GPT-4 Turbo.</li>
              <li>Högre hastighet: Signifikant lägre latens och ökad throughput.</li>
              <li>Bästa multimodalitet: Förbättrad hantering av text, bild, ljud och video.</li>
              <li>100% bakåtkompatibel: Enkelt att uppgradera befintliga integrationer.</li>
            </ul>

            <p>
              Uppdateringen är direkt tillgänglig via OpenAI API och dokumentationen är redan uppdaterad.
            </p>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Relaterade nyheter</h3>
              <div className="space-y-4">
                {[
                  { title: "Sverige i topp i Europa för AI-investeringar 2024", date: "15 maj 2024" },
                  { title: "5 verktyg som förenklar din utveckling med AI", date: "10 maj 2024" },
                  { title: "Säkra dina AI-applikationer – bästa praxis", date: "6 maj 2024" },
                ].map((item) => (
                  <Link key={item.title} href="#" className="block group">
                    <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 leading-snug">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.date}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-slate-900 mb-2">Få nyheter direkt</h3>
              <p className="text-sm text-slate-600 mb-3">Prenumerera på vårt nyhetsbrev.</p>
              <input type="email" placeholder="din.epost@exempel.se" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 mb-2" />
              <button className="w-full py-2 bg-indigo-700 text-white text-sm rounded-lg font-medium">Prenumerera</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
