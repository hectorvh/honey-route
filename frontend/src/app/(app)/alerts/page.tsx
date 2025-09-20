// frontend/src/app/(app)/alerts/page.tsx
'use client';

import AlertsClient from './AlertsClient';

export default function AlertsPage() {
  // Deja Alerts accesible sin auth local
  return <AlertsClient />;
}
