// frontend/src/app/(app)/hives/page.tsx
import { redirect } from 'next/navigation';
export default function LegacyHivesIndex() {
  redirect('/apiaries');
}
