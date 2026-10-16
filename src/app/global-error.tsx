'use client';
import ErrorScreen from '@/components/errors/ErrorScreen';
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return <html lang="en"><body><ErrorScreen onRetry={retry} /></body></html>;
}
