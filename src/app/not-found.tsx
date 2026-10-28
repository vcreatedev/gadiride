import Link from "next/link";
import NotFoundScene from "@/components/NotFoundScene";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink-900 pb-16 pt-32 text-center text-white">
      <div className="container-x">
        <p className="font-mono text-sm text-brand-500">Error 404</p>
        <h1 className="display mx-auto mt-3 max-w-[14ch] text-6xl text-white md:text-8xl">Wrong turn<span className="text-brand-500">.</span></h1>
        <p className="lead mx-auto mt-4 text-ink-300">This page does not exist. The road home is right here.</p>
        <Link href="/" className="btn-primary mt-8">Back to home</Link>
        <NotFoundScene />
      </div>
    </section>
  );
}
