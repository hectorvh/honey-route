// frontend/src/app/(app)/alerts/mock.ts
import {
  getDemoAlerts,
  type AlertItem,
  type AlertType,
  type Severity,
} from '@/mocks/demoGuestProfile';

export type { AlertItem, AlertType, Severity };

export function getMockAlerts(): AlertItem[] {
  return getDemoAlerts();
}
