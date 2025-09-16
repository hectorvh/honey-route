// frontend/src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-100 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-950 text-white p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-bold mb-2">Sin conexión</h1>
        <p className="text-neutral-300">Puedes seguir usando la app con contenido en caché.</p>
      </div>
    </div>
  );
}
