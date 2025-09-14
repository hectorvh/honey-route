import NavTab from '@/components/NavTab';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-20">
      <main className="mx-auto max-w-screen-md px-4 py-6">{children}</main>
      <NavTab />
    </div>
  );
}
