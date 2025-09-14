'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/hives', label: 'Hives' },
  { href: '/capture', label: 'Capture' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/settings', label: 'Settings' },
];

export default function NavTab() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-screen-md px-4">
        <ul className="flex items-center justify-between gap-2 py-2 text-sm">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`px-3 py-2 rounded-full transition
                    ${active ? 'bg-honey-500 text-black font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
