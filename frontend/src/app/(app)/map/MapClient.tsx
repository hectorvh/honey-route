'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';
import { installLeafletIcons } from './leaflet.setup';
import { getMockAlerts, type AlertItem } from '../alerts/mock';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

type Center = { lat: number; lng: number };

type HiveMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  source: 'mock' | 'local';
  apiaryId: string;
  apiaryName: string;
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

type HiveAlertSummary = {
  hiveId: string;
  hiveName: string;
  high: number;
  medium: number;
  low: number;
};

// Extensión suave: asumimos que las alertas pueden traer estos campos
type AlertWithDetails = AlertItem & {
  cause?: string;
  details?: string;
  description?: string;
};

// i18n helper
const tv = (
  t: (k: string, p?: Record<string, unknown>) => string,
  k: string,
  fb: string,
  p: Record<string, unknown> = {}
) => {
  const out = t(k, p);
  return out === k ? fb : out;
};

function BindMap({ onMap }: { onMap: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
}

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

// Helper para armar labels de conteo por severidad (100% i18n)
function buildCountsLabel(
  s: HiveAlertSummary,
  t: (k: string, p?: Record<string, unknown>) => string
): string {
  const parts: string[] = [];
  if (s.high > 0) parts.push(`${s.high} ${tv(t, 'alerts.sev.high', 'High')}`);
  if (s.medium > 0) parts.push(`${s.medium} ${tv(t, 'alerts.sev.medium', 'Medium')}`);
  if (s.low > 0) parts.push(`${s.low} ${tv(t, 'alerts.sev.low', 'Low')}`);
  return parts.join(', ');
}

export default function MapClient() {
  const { t } = useI18n();
  const sp = useSearchParams();

  const [center, setCenter] = useState<Center>({ lat: -15.793889, lng: -47.882778 });
  const [zoom, setZoom] = useState<number>(12);
  const [label, setLabel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const [selectedApiaryId, setSelectedApiaryId] = useState<string>('all');
  const [selectedHiveId, setSelectedHiveId] = useState<string>('');

  const mapRef = useRef<LeafletMap | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    installLeafletIcons();
  }, []);

  // ALERTS MOCK
  const alerts: AlertItem[] = useMemo(() => getMockAlerts(), []);

  // HIVES MOCK (desde alerts)
  const mockHives: HiveMarker[] = useMemo(() => {
    const m = new Map<string, HiveMarker>();
    for (const a of alerts) {
      if (
        a?.hive &&
        typeof a.hive.id === 'string' &&
        typeof a.hive.name === 'string' &&
        typeof a.hive.lat === 'number' &&
        typeof a.hive.lng === 'number'
      ) {
        m.set(a.hive.id, {
          id: a.hive.id,
          name: a.hive.name,
          lat: a.hive.lat,
          lng: a.hive.lng,
          source: 'mock',
          apiaryId: 'demo-apiary',
          apiaryName: 'Demo Apiary',
        });
      }
    }
    return Array.from(m.values());
  }, [alerts]);

  // HIVES LOCALES
  const [localHives, setLocalHives] = useState<HiveMarker[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLocalHives([]);
      return;
    }

    try {
      const storedHives = safeParseArray<StoredHive>(localStorage.getItem('hr.hives'));
      const storedApiaries = safeParseArray<StoredApiary>(localStorage.getItem('hr.apiaries'));

      const apiaryNameById = new Map<string, string>();
      for (const a of storedApiaries) {
        if (a && typeof a.id === 'string') {
          apiaryNameById.set(a.id, a.name ?? 'My Apiary');
        }
      }

      const locals: HiveMarker[] = storedHives
        .map((h) => {
          if (
            !h ||
            typeof h.id !== 'string' ||
            typeof h.apiaryId !== 'string' ||
            typeof h.label !== 'string' ||
            typeof h.lat !== 'number' ||
            typeof h.lng !== 'number'
          ) {
            return null;
          }
          return {
            id: h.id,
            name: h.label,
            lat: h.lat,
            lng: h.lng,
            source: 'local',
            apiaryId: h.apiaryId,
            apiaryName: apiaryNameById.get(h.apiaryId) ?? 'My Apiary',
          } as HiveMarker;
        })
        .filter((x): x is HiveMarker => x !== null);

      setLocalHives(locals);
    } catch {
      setLocalHives([]);
    }
  }, []);

  // UNION MOCK + LOCAL
  const hives: HiveMarker[] = useMemo(() => {
    const byId = new Map<string, HiveMarker>();
    for (const h of mockHives) byId.set(h.id, h);
    for (const h of localHives) {
      if (!byId.has(h.id)) byId.set(h.id, h);
    }
    return Array.from(byId.values());
  }, [mockHives, localHives]);

  // GRUPOS POR APIARIO
  type ApiaryGroup = {
    apiaryId: string;
    apiaryName: string;
    source: 'mock' | 'local' | 'mixed';
    hives: HiveMarker[];
  };

  const apiaryGroups: ApiaryGroup[] = useMemo(() => {
    const map = new Map<string, ApiaryGroup>();

    for (const h of hives) {
      const id = h.apiaryId ?? 'unknown';
      const existing = map.get(id);
      if (!existing) {
        map.set(id, {
          apiaryId: id,
          apiaryName: h.apiaryName ?? 'Unknown apiary',
          source: h.source,
          hives: [h],
        });
      } else {
        existing.hives.push(h);
        if (existing.source !== h.source) {
          existing.source = 'mixed';
        }
      }
    }

    return Array.from(map.values());
  }, [hives]);

  const apiaryOptions = useMemo(
    () => [
      { id: 'all', label: tv(t, 'map.filter.allApiaries', 'All apiaries') },
      ...apiaryGroups.map((g) => ({
        id: g.apiaryId,
        label: g.apiaryName,
      })),
    ],
    [apiaryGroups, t]
  );

  // HIVES visibles según filtro
  const displayHives: HiveMarker[] = useMemo(
    () =>
      selectedApiaryId === 'all' ? hives : hives.filter((h) => h.apiaryId === selectedApiaryId),
    [hives, selectedApiaryId]
  );

  const displayHiveIds = useMemo(() => new Set(displayHives.map((h) => h.id)), [displayHives]);

  const displayAlerts: AlertItem[] = useMemo(
    () => alerts.filter((a) => displayHiveIds.has(a.hive.id)),
    [alerts, displayHiveIds]
  );

  // ÍCONOS
  const normalIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<img src="/images/miel.png" style="width:28px;height:28px;display:block" />`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      }),
    []
  );

  const focusIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:46px;height:46px;border-radius:9999px;background:rgba(251,191,36,0.25);display:grid;place-items:center;box-shadow:0 0 0 2px rgba(251,191,36,0.6) inset">
                 <img src="/images/miel.png" style="width:30px;height:30px;display:block" />
               </div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -23],
      }),
    []
  );

  // Inicialización de mapa
  const initFromContext = (map: LeafletMap) => {
    mapRef.current = map;
    if (initializedRef.current) return;
    initializedRef.current = true;

    let target: { lat: number; lng: number; name: string; id: string } | null = null;

    const qsHive = sp.get('hiveId');

    if (qsHive) {
      const found = hives.find((h) => h.id === qsHive);
      if (found) {
        target = {
          lat: found.lat,
          lng: found.lng,
          name: found.name,
          id: found.id,
        };
      }
    }

    if (!target) {
      try {
        const raw = localStorage.getItem('map.highlight');
        if (raw) {
          const v = JSON.parse(raw) as {
            hiveId?: string;
            name?: string;
            lat?: number | null;
            lng?: number | null;
          };

          if (v.hiveId) {
            const found = hives.find((h) => h.id === v.hiveId);
            if (found) {
              target = {
                lat: found.lat,
                lng: found.lng,
                name: v.name ?? found.name,
                id: found.id,
              };
            } else if (typeof v.lat === 'number' && typeof v.lng === 'number') {
              target = {
                lat: v.lat,
                lng: v.lng,
                name: v.name ?? v.hiveId,
                id: v.hiveId,
              };
            }
          }
        }
      } catch {
        // ignore
      }
    }

    if (!target && hives.length > 0) {
      const h0 = hives[0];
      target = {
        lat: h0.lat,
        lng: h0.lng,
        name: h0.name,
        id: h0.id,
      };
    }

    if (target) {
      setCenter({ lat: target.lat, lng: target.lng });
      setZoom(15);
      setLabel(target.name);
      setHighlightId(target.id);
      map.setView([target.lat, target.lng], 15);
    } else {
      map.setView([center.lat, center.lng], zoom);
    }

    try {
      localStorage.removeItem('map.highlight');
    } catch {
      /* noop */
    }
  };

  // Geo
  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      alert(tv(t, 'map.noGeo', 'Geolocation not available'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(next);
        setZoom(14);
        setLabel(null);
        setHighlightId(null);
        mapRef.current?.flyTo(next, 14);
      },
      () => alert(tv(t, 'map.geoDenied', 'Permission denied')),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setZoom(mapRef.current.getZoom());
    }
  };
  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setZoom(mapRef.current.getZoom());
    }
  };

  // Búsqueda
  const onSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = displayHives.find((h) => h.name.toLowerCase().includes(q));
    if (found) {
      const next = { lat: found.lat, lng: found.lng };
      setCenter(next);
      setZoom(15);
      setLabel(found.name);
      setHighlightId(found.id);
      setSelectedHiveId(found.id);
      mapRef.current?.flyTo([found.lat, found.lng], 15);
    }
  };

  // Cambiar foco cuando eliges hive
  useEffect(() => {
    if (!selectedHiveId) return;
    const h = hives.find((x) => x.id === selectedHiveId);
    if (!h) return;
    const next = { lat: h.lat, lng: h.lng };
    setCenter(next);
    setZoom(15);
    setLabel(h.name);
    setHighlightId(h.id);
    mapRef.current?.flyTo([h.lat, h.lng], 15);
  }, [selectedHiveId, hives]);

  // Severidad global (solo hives visibles)
  const sevCounts = useMemo(
    () =>
      displayAlerts.reduce(
        (acc, a) => {
          acc[a.severity] += 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0 } as { high: number; medium: number; low: number }
      ),
    [displayAlerts]
  );

  // Resumen por hive
  const hiveAlertSummaries: HiveAlertSummary[] = useMemo(() => {
    const map = new Map<string, HiveAlertSummary>();
    for (const a of displayAlerts) {
      const id = a.hive.id;
      const name = a.hive.name;
      const existing = map.get(id);
      if (!existing) {
        map.set(id, {
          hiveId: id,
          hiveName: name,
          high: a.severity === 'high' ? 1 : 0,
          medium: a.severity === 'medium' ? 1 : 0,
          low: a.severity === 'low' ? 1 : 0,
        });
      } else {
        if (a.severity === 'high') existing.high += 1;
        if (a.severity === 'medium') existing.medium += 1;
        if (a.severity === 'low') existing.low += 1;
      }
    }
    return Array.from(map.values());
  }, [displayAlerts]);

  const getRiskLevel = (s: HiveAlertSummary): string => {
    if (s.high > 0) return tv(t, 'alerts.sev.high', 'High');
    if (s.medium > 0) return tv(t, 'alerts.sev.medium', 'Medium');
    if (s.low > 0) return tv(t, 'alerts.sev.low', 'Low');
    return tv(t, 'map.alertRisk.none', 'None');
  };

  return (
    <CardShell
      headerLeft={<BrandMark />}
      headerRight={<LangToggle />}
      contentClassName="pb-28 pt-2"
      footer={<NavTab active="map" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">{tv(t, 'map.title', 'Map')}</h1>

      {/* Search */}
      <div className="mt-3 mb-3 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-full bg-neutral-900 px-3 py-2 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-amber-400">
          <span className="px-2 text-neutral-500 text-sm">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder={tv(t, 'map.searchPh', 'Search hives or locations')}
            className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
          />
        </div>
        <button
          onClick={onSearch}
          className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-amber-300"
        >
          {tv(t, 'map.search', 'Search')}
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-3 grid gap-2 rounded-2xl bg-neutral-900 p-3 text-sm ring-1 ring-black/5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {tv(t, 'map.filter.apiary', 'Apiary')}
          </label>
          <select
            className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none ring-1 ring-black/40"
            value={selectedApiaryId}
            onChange={(e) => {
              setSelectedApiaryId(e.target.value);
              setSelectedHiveId('');
              setLabel(null);
              setHighlightId(null);
            }}
          >
            {apiaryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {tv(t, 'map.filter.hive', 'Focus hive (optional)')}
          </label>
          <select
            className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none ring-1 ring-black/40 disabled:opacity-50"
            value={selectedHiveId}
            onChange={(e) => setSelectedHiveId(e.target.value)}
            disabled={displayHives.length === 0}
          >
            <option value="">
              {tv(t, 'map.filter.hivePlaceholder', 'Select a hive to focus')}
            </option>
            {displayHives.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} {h.source === 'local' ? tv(t, 'map.tag.local', '· local') : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAPA */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <BindMap onMap={initFromContext} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />

          {displayHives.map((h) => {
            const summary = hiveAlertSummaries.find((s) => s.hiveId === h.id) ?? null;
            const riskLabel = summary ? getRiskLevel(summary) : null;
            const counts = summary ? buildCountsLabel(summary, t) : null;

            // Todas las alertas de este hive (para Cause / Details)
            const hiveAlerts = displayAlerts.filter((a) => a.hive.id === h.id);

            return (
              <Marker
                key={h.id}
                position={[h.lat, h.lng]}
                icon={highlightId === h.id ? focusIcon : normalIcon}
                eventHandlers={{
                  click: () => {
                    const next = { lat: h.lat, lng: h.lng };
                    setCenter(next);
                    setLabel(h.name);
                    setHighlightId(h.id);
                    setSelectedHiveId(h.id);
                    mapRef.current?.flyTo([h.lat, h.lng], 15);
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <p className="font-semibold">
                      {h.name} {h.source === 'local' ? tv(t, 'map.tag.local', '· local') : ''}
                    </p>
                    <p className="text-xs text-neutral-600">{h.apiaryName}</p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                    </p>

                    {hiveAlerts.length > 0 && (
                      <div className="mt-2 rounded-lg bg-neutral-900/95 p-3 ring-1 ring-black/40">
                        <p className="text-[11px] font-semibold text-neutral-50">
                          {tv(t, 'map.alertWhy', 'Why this alert was triggered')}
                        </p>

                        {/* Si hay resumen de riesgo, lo mostramos arriba */}
                        {riskLabel && (
                          <p className="mt-1 text-[11px] text-neutral-200">
                            <span className="font-semibold">
                              {tv(t, 'map.alertRiskLabel', 'Risk level')}:
                            </span>{' '}
                            {riskLabel}
                            {counts ? ` · ${counts}` : ''}
                          </p>
                        )}

                        <div className="mt-2 space-y-1.5">
                          {hiveAlerts.map((a) => {
                            const alert = a as AlertWithDetails;
                            const cause =
                              alert.cause ??
                              alert.description ??
                              tv(
                                t,
                                'map.alert.defaultCause',
                                'Condition outside the recommended range.'
                              );
                            const details =
                              alert.details ??
                              tv(
                                t,
                                'map.alert.defaultDetails',
                                'Check hive conditions and recent activity.'
                              );

                            return (
                              <div key={alert.id} className="border-t border-neutral-800 pt-1.5">
                                <p className="text-[11px] font-semibold text-neutral-200">
                                  {tv(t, 'map.alert.cause', 'Cause')}:{' '}
                                  <span className="font-normal">{cause}</span>
                                </p>
                                <p className="mt-0.5 text-[11px] text-neutral-400">
                                  {tv(t, 'map.alert.details', 'Details')}:{' '}
                                  <span className="font-normal">{details}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      className="mt-2 rounded-md bg-amber-400 px-2 py-1 text-xs font-semibold text-black hover:bg-amber-300"
                      onClick={() => {
                        const next = { lat: h.lat, lng: h.lng };
                        setCenter(next);
                        setZoom(15);
                        setLabel(h.name);
                        setHighlightId(h.id);
                        setSelectedHiveId(h.id);
                        mapRef.current?.flyTo([h.lat, h.lng], 15);
                      }}
                    >
                      {tv(t, 'map.zoomHere', 'Zoom here')}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Zoom */}
        <div className="absolute right-3 bottom-20 z-[1000] grid overflow-hidden rounded-xl bg-white/90 text-black shadow">
          <button
            onClick={zoomIn}
            className="px-3 py-2 font-semibold hover:bg-black/5"
            aria-label={tv(t, 'map.a11y.zoomIn', 'Zoom in')}
          >
            +
          </button>
          <div className="h-px bg-black/10" />
          <button
            onClick={zoomOut}
            className="px-3 py-2 font-semibold hover:bg-black/5"
            aria-label={tv(t, 'map.a11y.zoomOut', 'Zoom out')}
          >
            −
          </button>
        </div>

        {/* Locate */}
        <button
          onClick={locateMe}
          className="absolute right-3 bottom-3 z-[1000] rounded-full bg-amber-400 px-4 py-3 font-semibold text-black shadow-lg hover:bg-amber-300"
        >
          {tv(t, 'map.locate', 'Locate me')}
        </button>

        {/* Etiqueta hive enfocado */}
        {label && (
          <div className="absolute left-3 top-3 z-[1000] rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            {label}
          </div>
        )}
      </div>

      {/* Panel inferior: resumen + grupos */}
      <div className="mt-4 grid gap-3">
        {/* Resumen de alertas */}
        <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">{tv(t, 'alerts.title', 'Alerts')}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-rose-500 px-2.5 py-1 font-semibold text-white">
              {tv(t, 'alerts.sev.high', 'High')}: {sevCounts.high}
            </span>
            <span className="rounded-full bg-amber-400 px-2.5 py-1 font-semibold text-black">
              {tv(t, 'alerts.sev.medium', 'Medium')}: {sevCounts.medium}
            </span>
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 font-semibold text-white">
              {tv(t, 'alerts.sev.low', 'Low')}: {sevCounts.low}
            </span>
          </div>

          {hiveAlertSummaries.length === 0 ? (
            <p className="mt-3 text-xs text-neutral-400">
              {tv(t, 'alerts.empty', 'No alerts for the hives currently visible on the map.')}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {hiveAlertSummaries.map((s) => (
                <button
                  key={s.hiveId}
                  type="button"
                  onClick={() => {
                    const h = hives.find((x) => x.id === s.hiveId);
                    if (!h) return;
                    const next = { lat: h.lat, lng: h.lng };
                    setCenter(next);
                    setZoom(15);
                    setLabel(h.name);
                    setHighlightId(h.id);
                    setSelectedHiveId(h.id);
                    mapRef.current?.flyTo([h.lat, h.lng], 15);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-neutral-800/60 px-3 py-2 text-left text-xs hover:bg-neutral-800"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.hiveName}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">{buildCountsLabel(s, t)}</p>
                  </div>
                  <span className="ml-2 text-neutral-500 text-sm">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grupos por apiario */}
        <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">{tv(t, 'map.groups.title', 'Apiaries on map')}</p>
          {apiaryGroups.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-400">
              {tv(t, 'map.groups.empty', 'No hives to display yet.')}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {apiaryGroups.map((g) => (
                <div
                  key={g.apiaryId}
                  className="rounded-xl bg-neutral-800/60 p-3 ring-1 ring-black/10"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{g.apiaryName}</p>
                    <span className="ml-2 text-xs text-neutral-400">
                      {g.hives.length}{' '}
                      {g.hives.length === 1
                        ? tv(t, 'map.groups.hiveLabel.one', 'hive')
                        : tv(t, 'map.groups.hiveLabel.many', 'hives')}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.hives.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          const next = { lat: h.lat, lng: h.lng };
                          setCenter(next);
                          setZoom(15);
                          setLabel(h.name);
                          setHighlightId(h.id);
                          setSelectedHiveId(h.id);
                          setSelectedApiaryId(g.apiaryId);
                          mapRef.current?.flyTo([h.lat, h.lng], 15);
                        }}
                        className={`rounded-full px-2 py-1 text-[11px] ring-1 ring-black/40 ${
                          highlightId === h.id
                            ? 'bg-amber-400/20 text-amber-200'
                            : 'bg-black/40 text-neutral-200 hover:bg-black/60'
                        }`}
                      >
                        {h.name}
                        {h.source === 'local' ? ` ${tv(t, 'map.tag.local', '· local')}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}
