'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">U</div>
          <span className="text-2xl font-semibold">utvecklare<span className="text-cyan-400">.ai</span></span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Kommer snart
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed">
          Vi bygger något nytt för AI-utvecklare.<br />
          Snart tillbaka.
        </p>

        <div className="mt-12 text-sm text-slate-500">
          utvecklare.ai
        </div>
      </div>
    </div>
  );
}
