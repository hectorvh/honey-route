import Link from 'next/link';
export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">HoneyRoute</h1>
      <p className="mt-2">
        Ir a{' '}
        <Link className="underline" href="/hives">
          Hives
        </Link>
      </p>
    </main>
  );
}
