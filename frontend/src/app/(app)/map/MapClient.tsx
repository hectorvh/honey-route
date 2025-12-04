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

// Importa react-leaflet directo (este archivo es 'use client', así que es seguro)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

type Center = { lat: number; lng: number };

// i18n helper (fallback)
const tv = (
  t: (k: string, p?: Record<string, unknown>) => string,
  k: string,
  fb: string,
  p?: Record<string, unknown>
) => {
  const out = t(k, p);
  return out === k ? fb : out;
};

// Exponer la instancia del mapa (sin SSR)
function BindMap({ onMap }: { onMap: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
}

export default function MapClient() {
  const { t } = useI18n();
  const sp = useSearchParams();

  // Brasília por defecto
  const [center, setCenter] = useState<Center>({ lat: -15.793889, lng: -47.882778 });
  const [zoom, setZoom] = useState<number>(12);
  const [label, setLabel] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // hive resaltado (si viene de “go to hive”)
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const mapRef = useRef<LeafletMap | null>(null);

  // Arregla iconos por defecto de Leaflet (rutas de imágenes)
  useEffect(() => {
    installLeafletIcons();
  }, []);

  // Hives desde alerts mock (dedupe por hive.id)
  const alerts: AlertItem[] = useMemo(() => getMockAlerts(), []);
  const hives = useMemo(() => {
    const m = new Map<string, { id: string; name: string; lat: number; lng: number }>();
    for (const a of alerts) m.set(a.hive.id, a.hive);
    return Array.from(m.values());
  }, [alerts]);

  // Íconos: normal y resaltado (miel.png con wrapper para highlight)
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

  // Lee highlight desde query (?hiveId=...) o localStorage (map.highlight)
  useEffect(() => {
    const qsHive = sp.get('hiveId');
    if (qsHive) {
      const h = hives.find((x) => x.id === qsHive);
      if (h) {
        setCenter({ lat: h.lat, lng: h.lng });
        setZoom(15);
        setLabel(h.name);
        setHighlightId(h.id);
        mapRef.current?.flyTo([h.lat, h.lng], 15);
        return;
      }
    }
    try {
      const raw = localStorage.getItem('map.highlight');
      if (raw) {
        const v = JSON.parse(raw) as { hiveId: string; name: string; lat: number; lng: number };
        setCenter({ lat: v.lat, lng: v.lng });
        setZoom(15);
        setLabel(v.name ?? null);
        setHighlightId(v.hiveId);
        mapRef.current?.flyTo([v.lat, v.lng], 15);
        localStorage.removeItem('map.highlight');
      }
    } catch {
      /* noop */
    }
  }, [sp, hives]);

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

  // Buscar por nombre (Enter centra y resalta primer match)
  const onSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = hives.find((h) => h.name.toLowerCase().includes(q));
    if (found) {
      setCenter({ lat: found.lat, lng: found.lng });
      setZoom(15);
      setLabel(found.name);
      setHighlightId(found.id);
      mapRef.current?.flyTo([found.lat, found.lng], 15);
    }
  };

  // Conteo por severidad para tarjeta resumen
  const sevCounts = useMemo(() => {
    return alerts.reduce(
      (acc, a) => {
        acc[a.severity] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 } as { high: number; medium: number; low: number }
    );
  }, [alerts]);

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
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder={tv(t, 'map.searchPh', 'Search hives or locations')}
          className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm placeholder:text-neutral-500 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
        <button
          onClick={onSearch}
          className="shrink-0 rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow hover:bg-amber-300"
        >
          {tv(t, 'map.search', 'Search')}
        </button>
      </div>

      {/* MAPA */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          whenReady={() => {
            /* tipos: () => void */
          }}
        >
          <BindMap onMap={(m) => (mapRef.current = m)} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />

          {/* Siempre muestra TODOS los hives; resalta si coincide con highlightId */}
          {hives.map((h) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              icon={highlightId === h.id ? focusIcon : normalIcon}
              eventHandlers={{
                click: () => {
                  setCenter({ lat: h.lat, lng: h.lng });
                  setLabel(h.name);
                  setHighlightId(h.id);
                },
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold">{h.name}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </p>
                  <button
                    className="mt-2 rounded-md bg-amber-400 px-2 py-1 text-xs font-semibold text-black hover:bg-amber-300"
                    onClick={() => mapRef.current?.flyTo([h.lat, h.lng], 15)}
                  >
                    {tv(t, 'map.zoomHere', 'Zoom here')}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
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

        {/* Etiqueta del hive enfocado */}
        {label && (
          <div className="absolute left-3 top-3 z-[1000] rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            {label}
          </div>
        )}
      </div>

      {/* Panel inferior útil: resumen + chips para enfocar (ahora con coords) */}
      <div className="mt-4 grid gap-3">
        {/* Resumen de alertas */}
        <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">{tv(t, 'alerts.title', 'Alerts')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
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
        </div>

        {/* Lista rápida de hives (con coordenadas) */}
        <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">{tv(t, 'map.hives', 'Hives')}</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {hives.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setCenter({ lat: h.lat, lng: h.lng });
                  setZoom(15);
                  setLabel(h.name);
                  setHighlightId(h.id);
                  mapRef.current?.flyTo([h.lat, h.lng], 15);
                }}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-left ring-1 ring-black/5 ${
                  highlightId === h.id
                    ? 'bg-amber-400/10'
                    : 'bg-neutral-800/50 hover:bg-neutral-800'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{h.name}</p>
                  <p className="text-xs text-neutral-400">
                    {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </p>
                </div>
                <span className="ml-3 rounded-full bg-neutral-900 px-2 py-1 text-xs">
                  {tv(t, 'home.hivesCount', '{{count}} hives', { count: 1 }).replace(
                    '{{count}}',
                    '1'
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}
