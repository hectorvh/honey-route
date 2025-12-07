'use client';

import { useEffect, useState } from 'react';

// Hives demo que le pasas al hook
export type DemoHive = {
  id: string;
  apiaryId: string;
  label: string;
  apiaryName?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type StoredHive = {
  id: string;
  apiaryId: string;
  kind: string;
  label: string;
  notes?: string | null;
  lat: number;
  lng: number;
};

type StoredApiary = {
  id: string;
  name?: string | null;
};

export type QuickHive = {
  id: string;
  apiaryId: string;
  label: string;
  apiaryName?: string | null;
  lat: number | null;
  lng: number | null;
  source: 'demo' | 'local';
};

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    return [];
  } catch {
    return [];
  }
}

export function useQuickHives(demoHives: DemoHive[]): QuickHive[] {
  const [all, setAll] = useState<QuickHive[]>(
    demoHives.map((h) => ({
      id: h.id,
      apiaryId: h.apiaryId,
      label: h.label,
      apiaryName: h.apiaryName ?? null,
      lat: h.lat ?? null,
      lng: h.lng ?? null,
      source: 'demo',
    }))
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      setAll(
        demoHives.map((h) => ({
          id: h.id,
          apiaryId: h.apiaryId,
          label: h.label,
          apiaryName: h.apiaryName ?? null,
          lat: h.lat ?? null,
          lng: h.lng ?? null,
          source: 'demo',
        }))
      );
      return;
    }

    try {
      const storedHives = safeParseArray<StoredHive>(localStorage.getItem('hr.hives'));
      const storedApiaries = safeParseArray<StoredApiary>(localStorage.getItem('hr.apiaries'));

      const apiaryNameById = new Map<string, string>();
      for (const a of storedApiaries) {
        if (a && a.id) {
          apiaryNameById.set(a.id, a.name ?? 'My Apiary');
        }
      }

      const locals: QuickHive[] = storedHives
        .map((h) => {
          if (!h || typeof h.id !== 'string' || typeof h.apiaryId !== 'string') return null;
          return {
            id: h.id,
            apiaryId: h.apiaryId,
            label: h.label,
            apiaryName: apiaryNameById.get(h.apiaryId) ?? null,
            lat: typeof h.lat === 'number' ? h.lat : null,
            lng: typeof h.lng === 'number' ? h.lng : null,
            source: 'local',
          } as QuickHive;
        })
        .filter((x): x is QuickHive => x !== null);

      const demoMapped: QuickHive[] = demoHives.map((h) => ({
        id: h.id,
        apiaryId: h.apiaryId,
        label: h.label,
        apiaryName: h.apiaryName ?? null,
        lat: h.lat ?? null,
        lng: h.lng ?? null,
        source: 'demo',
      }));

      const existingIds = new Set(demoMapped.map((h) => h.id));
      const onlyNewLocals = locals.filter((h) => !existingIds.has(h.id));

      setAll([...demoMapped, ...onlyNewLocals]);
    } catch {
      setAll(
        demoHives.map((h) => ({
          id: h.id,
          apiaryId: h.apiaryId,
          label: h.label,
          apiaryName: h.apiaryName ?? null,
          lat: h.lat ?? null,
          lng: h.lng ?? null,
          source: 'demo',
        }))
      );
    }
  }, [demoHives]);

  return all;
}
