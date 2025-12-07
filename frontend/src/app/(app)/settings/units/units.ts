// frontend/src/app/(app)/settings/units/units.ts
import { useEffect, useState } from 'react';

export type TemperatureUnit = 'c' | 'f';
export type DistanceUnit = 'km' | 'mi';
export type WeightUnit = 'kg' | 'lb';

export type Units = {
  temperature: TemperatureUnit;
  distance: DistanceUnit;
  weight: WeightUnit;
};

function detectLocale(): 'en' | 'es' {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('hr.locale');
    if (stored === 'es' || stored === 'en') return stored;
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('es')) return 'es';
    return 'en';
  } catch {
    return 'en';
  }
}

function getDefaultUnitsForLocale(): Units {
  const locale = detectLocale();
  // ES/MX -> métrico, EN (assumimos USA) -> imperial
  if (locale === 'es') {
    return { temperature: 'c', distance: 'km', weight: 'kg' };
  }
  return { temperature: 'f', distance: 'mi', weight: 'lb' };
}

export const DEFAULT_UNITS: Units = getDefaultUnitsForLocale();

export function loadUnits(): Units {
  if (typeof window === 'undefined') return DEFAULT_UNITS;
  try {
    const raw = localStorage.getItem('hr.units');
    if (!raw) return DEFAULT_UNITS;
    const parsed = JSON.parse(raw) as Partial<Units>;
    return {
      temperature: parsed.temperature ?? DEFAULT_UNITS.temperature,
      distance: parsed.distance ?? DEFAULT_UNITS.distance,
      weight: parsed.weight ?? DEFAULT_UNITS.weight,
    };
  } catch {
    return DEFAULT_UNITS;
  }
}

export function useUnits(): Units {
  const [units, setUnits] = useState<Units>(DEFAULT_UNITS);
  useEffect(() => {
    setUnits(loadUnits());
  }, []);
  return units;
}

/* ---------- conversion helpers ---------- */

export function toDisplayTemp(valueC: number, units: Units): { value: number; unit: '°C' | '°F' } {
  if (units.temperature === 'f') {
    return { value: (valueC * 9) / 5 + 32, unit: '°F' };
  }
  return { value: valueC, unit: '°C' };
}

export function toDisplayWeightKg(
  valueKg: number,
  units: Units
): { value: number; unit: 'kg' | 'lb' } {
  if (units.weight === 'lb') {
    return { value: valueKg * 2.20462, unit: 'lb' };
  }
  return { value: valueKg, unit: 'kg' };
}

export function toDisplayDistanceKm(
  valueKm: number,
  units: Units
): { value: number; unit: 'km' | 'mi' } {
  if (units.distance === 'mi') {
    return { value: valueKm * 0.621371, unit: 'mi' };
  }
  return { value: valueKm, unit: 'km' };
}

// Para elevación usamos distance como proxy: km → metros, mi → pies
export function toDisplayElevationMeters(
  valueM: number,
  units: Units
): { value: number; unit: 'm' | 'ft' } {
  if (units.distance === 'mi') {
    return { value: valueM * 3.28084, unit: 'ft' };
  }
  return { value: valueM, unit: 'm' };
}
