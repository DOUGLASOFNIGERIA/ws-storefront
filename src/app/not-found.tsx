import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[900px] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-display text-7xl tracking-[-0.01em] sm:text-7xl">Not found.</h1>
      <p className="mt-4 text-sm text-muted">That page or product isn&apos;t here.</p>
      <Link href="/collections/all" className="btn-primary mt-10">
        Shop all
      </Link>
    </div>
  );
}
