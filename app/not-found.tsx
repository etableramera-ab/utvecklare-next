import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sidan hittades inte",
  description: "Sidan du söker finns inte.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {},
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-heading font-semibold text-gray-200 mb-4">404</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-primary mb-3">
          Sidan hittades inte
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Till startsidan
        </Link>
      </div>
    </main>
  );
}
