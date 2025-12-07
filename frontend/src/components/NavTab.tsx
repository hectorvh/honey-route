// components/NavTab.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';

type TabKey = 'home' | 'alerts' | 'map' | 'analytics' | 'settings';

const LABELS = {
  home: 'home.nav.home',
  alerts: 'home.nav.alerts',
  map: 'home.nav.map',
  analytics: 'home.nav.analytics',
  settings: 'home.nav.settings',
} as const;

type Tab = {
  key: TabKey;
  href: string;
  icon: string;
  tKey: keyof typeof LABELS;
};

const TABS: Tab[] = [
  { key: 'home', href: '/apiaries', icon: '/images/home.png', tKey: 'home' },
  { key: 'alerts', href: '/alerts', icon: '/images/warning.png', tKey: 'alerts' },
  { key: 'map', href: '/map', icon: '/images/map.png', tKey: 'map' },
  // v1.2: nueva pestaña de Analytics
  { key: 'analytics', href: '/analytics', icon: '/images/analytics.png', tKey: 'analytics' },
  { key: 'settings', href: '/settings', icon: '/images/settings.png', tKey: 'settings' },
];

export default function NavTab({ active }: { active?: TabKey }) {
  const { t } = useI18n();
  const pathname = usePathname() || '';

  const isActive = (tab: Tab) => (active ? active === tab.key : pathname.startsWith(tab.href));

  return (
    <nav className="w-full">
      <ul className="grid grid-cols-5 gap-2">
        {TABS.map((tab) => {
          const a = isActive(tab);
          const base =
            'flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition no-underline';
          const cls = a
            ? base + ' bg-amber-400 text-black font-semibold'
            : base + ' text-white/90 hover:bg-white/10';

          return (
            <li key={tab.key}>
              <Link href={tab.href} className={cls} aria-current={a ? 'page' : undefined}>
                <Image
                  src={tab.icon}
                  alt=""
                  width={20}
                  height={20}
                  style={a ? undefined : { filter: 'invert(1) brightness(1.2)' }}
                />
                <span className="text-xs leading-none">{t(LABELS[tab.tKey])}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
