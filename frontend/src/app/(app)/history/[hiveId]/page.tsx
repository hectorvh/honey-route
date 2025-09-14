export default function History({ params }: { params: { hiveId: string } }) {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">History {params.hiveId}</h1>
    </main>
  );
}
