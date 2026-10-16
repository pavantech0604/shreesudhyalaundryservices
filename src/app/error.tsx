'use client';
import ErrorScreen from '@/components/errors/ErrorScreen';
export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return <ErrorScreen onRetry={retry} />;
}
