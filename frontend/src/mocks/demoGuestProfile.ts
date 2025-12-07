// frontend/src/mocks/demoGuestProfile.ts

export type AlertType = 'temp' | 'humidity' | 'queen';
export type Severity = 'high' | 'medium' | 'low';

export type DemoApiary = {
  id: string;
  name: string;
  owner: 'azul' | 'hector';
  location: string;
  lat: number;
  lng: number;
  elevation?: number;
  mgmt?: 'integrated' | 'conventional' | 'organic';
  notes?: string;
  status?: 'healthy' | 'attention' | 'critical';
  imageUrl?: string;
};

export type DemoHive = {
  id: string;
  apiaryId: string;
  label: string;
  kind: 'langstroth' | 'topbar' | 'warre';
  lat: number;
  lng: number;
  status: 'healthy' | 'attention' | 'critical';
  healthScore: number; // 0–100
};

export type AlertItem = {
  id: string;
  type: AlertType;
  severity: Severity;
  createdAt: string;
  title: string;
  listKey?: string;
  listText?: string;
  hive: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    apiaryId: string;
  };
  cause?: string;
  details?: string;
};

export type DemoProfile = {
  apiaries: DemoApiary[];
  hives: DemoHive[];
  alerts: AlertItem[];
};

const NOW = Date.now();
const minutesAgo = (min: number) => new Date(NOW - min * 60_000).toISOString();

/* ------------ APIARIOS ------------ */

const APIARIES: DemoApiary[] = [
  {
    id: 'apiary-azul',
    name: "Azul's Rooftop Apiary",
    owner: 'azul',
    location: 'CDMX · Rooftop test',
    lat: 19.4326,
    lng: -99.1332,
    elevation: 2240,
    mgmt: 'integrated',
    notes: 'Urban rooftop test apiary with mixed flora and strong sun exposure.',
    status: 'attention',
    imageUrl: '/images/apiary-azul2.jpg', // si no tienes la imagen no pasa nada, puede ser undefined
  },
  {
    id: 'apiary-hector',
    name: "Héctor's Hillside Apiary",
    owner: 'hector',
    location: 'Hillside near Pachuca',
    lat: 20.116,
    lng: -98.733,
    elevation: 2400,
    mgmt: 'organic',
    notes: 'Hillside apiary with strong winds and cooler nights.',
    status: 'healthy',
    imageUrl: '/images/apiary-hector.jpg',
  },
];

/* ------------ HIVES ------------ */

const HIVES: DemoHive[] = [
  // Azul
  {
    id: 'hive-azul-a01',
    apiaryId: 'apiary-azul',
    label: 'Hive A-01 · Rooftop',
    kind: 'langstroth',
    lat: 19.4329,
    lng: -99.1334,
    status: 'attention',
    healthScore: 78,
  },
  {
    id: 'hive-azul-a02',
    apiaryId: 'apiary-azul',
    label: 'Hive A-02 · Shaded',
    kind: 'langstroth',
    lat: 19.4323,
    lng: -99.1331,
    status: 'healthy',
    healthScore: 88,
  },
  {
    id: 'hive-azul-a03',
    apiaryId: 'apiary-azul',
    label: 'Hive A-03 · Experimental',
    kind: 'topbar',
    lat: 19.433,
    lng: -99.1337,
    status: 'critical',
    healthScore: 52,
  },
  // Héctor
  {
    id: 'hive-hector-h01',
    apiaryId: 'apiary-hector',
    label: 'Hive H-01 · Hillside',
    kind: 'langstroth',
    lat: 20.1163,
    lng: -98.7332,
    status: 'healthy',
    healthScore: 90,
  },
  {
    id: 'hive-hector-h02',
    apiaryId: 'apiary-hector',
    label: 'Hive H-02 · Windy',
    kind: 'warre',
    lat: 20.117,
    lng: -98.734,
    status: 'attention',
    healthScore: 74,
  },
];

/* ------------ ALERTAS (ligadas a esas hives) ------------ */

const ALERTS: AlertItem[] = [
  {
    id: 'a1',
    type: 'temp',
    severity: 'high',
    createdAt: minutesAgo(12),
    title: 'High temperature detected',
    listKey: 'alerts.items.a1.list',
    listText: 'High Temperature',
    hive: {
      id: 'hive-azul-a01',
      name: 'Hive A-01 · Rooftop',
      lat: 19.4329,
      lng: -99.1334,
      apiaryId: 'apiary-azul',
    },
    cause: 'Brood nest temperature above optimal range for >30 minutes.',
    details:
      'Sensors detected a sustained brood nest temperature above 37.5°C. Ventilation may be insufficient during peak sun hours on the rooftop.',
  },
  {
    id: 'a2',
    type: 'humidity',
    severity: 'medium',
    createdAt: minutesAgo(25),
    title: 'Humidity out of optimal range',
    listKey: 'alerts.items.a2.list',
    listText: 'Humidity Alert',
    hive: {
      id: 'hive-azul-a02',
      name: 'Hive A-02 · Shaded',
      lat: 19.4323,
      lng: -99.1331,
      apiaryId: 'apiary-azul',
    },
    cause: 'Internal humidity above recommended range for brood rearing.',
    details:
      'Relative humidity has been above 80% for the last 2 hours. Check for condensation on inner cover and airflow obstructions.',
  },
  {
    id: 'a3',
    type: 'queen',
    severity: 'high',
    createdAt: minutesAgo(55),
    title: 'Queen status requires attention',
    listKey: 'alerts.items.a3.list',
    listText: 'Queen Status',
    hive: {
      id: 'hive-azul-a03',
      name: 'Hive A-03 · Experimental',
      lat: 19.433,
      lng: -99.1337,
      apiaryId: 'apiary-azul',
    },
    cause: 'Irregular queen pattern and drop in brood area.',
    details:
      'Last inspection detected patchy brood pattern and reduced egg laying. Colony may be preparing for supersedure or queen may be failing.',
  },
  {
    id: 'a4',
    type: 'temp',
    severity: 'low',
    createdAt: minutesAgo(90),
    title: 'Low temperature detected',
    listKey: 'alerts.items.a4.list',
    listText: 'Low Temperature',
    hive: {
      id: 'hive-hector-h01',
      name: 'Hive H-01 · Hillside',
      lat: 20.1163,
      lng: -98.7332,
      apiaryId: 'apiary-hector',
    },
    cause: 'Brood nest temperature slightly below target range overnight.',
    details:
      'Short low-temperature event detected before sunrise. Usually safe, but monitor if pattern repeats in the next days.',
  },
  {
    id: 'a5',
    type: 'humidity',
    severity: 'high',
    createdAt: minutesAgo(180),
    title: 'Humidity below optimal range',
    listText: 'Low Humidity',
    hive: {
      id: 'hive-hector-h02',
      name: 'Hive H-02 · Windy',
      lat: 20.117,
      lng: -98.734,
      apiaryId: 'apiary-hector',
    },
    cause: 'Internal humidity dropped below 45% for extended period.',
    details:
      'Dry, windy conditions plus strong ventilation may be reducing internal humidity. Risk of brood drying if it persists.',
  },
];

const DEMO_PROFILE: DemoProfile = {
  apiaries: APIARIES,
  hives: HIVES,
  alerts: ALERTS,
};
/* ------------ exports simples para otros mocks ------------ */

export const demoApiaries = APIARIES;
export const demoHives = HIVES;

/* ------------ helpers para que cada pantalla consuma lo que necesita ------------ */

export function getDemoProfile(): DemoProfile {
  return DEMO_PROFILE;
}

export function getDemoApiaries(): DemoApiary[] {
  return DEMO_PROFILE.apiaries;
}

export function getDemoHives(apiaryId?: string): DemoHive[] {
  if (!apiaryId) return DEMO_PROFILE.hives;
  return DEMO_PROFILE.hives.filter((h) => h.apiaryId === apiaryId);
}

export function getDemoAlerts(): AlertItem[] {
  return DEMO_PROFILE.alerts;
}

/**
 * Opcional: sembrar localStorage solo si está vacío
 * para que el guest tenga demo data pero luego puedas crear cosas reales.
 */
export function seedDemoIntoLocalStorageIfEmpty() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('hr.demoSeeded') === '1') return;

  try {
    // active apiary por defecto = apiary-azul
    const azulApiary = APIARIES.find((a) => a.id === 'apiary-azul');
    if (azulApiary) {
      localStorage.setItem(
        'hr.apiary',
        JSON.stringify({ id: azulApiary.id, name: azulApiary.name, location: azulApiary.location })
      );
    }

    localStorage.setItem(
      'hr.hives',
      JSON.stringify(
        DEMO_PROFILE.hives.map((h) => ({
          id: h.id,
          apiary_id: h.apiaryId,
          apiaryId: h.apiaryId,
          label: h.label,
          lat: h.lat,
          lng: h.lng,
        }))
      )
    );

    localStorage.setItem('hr.demoSeeded', '1');
  } catch {
    // ignore
  }
}
