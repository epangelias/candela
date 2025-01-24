import { Signal } from '@preact/signals';
import { fetchOrError } from '@/lib/utils/fetch.ts';
import { Meth } from '@/lib/utils/meth.ts';

export function syncSSE<T>(endpoint: string, { data, onError }: { data: Signal<T>; onError?: () => void }) {
  return watchSSE(endpoint, {
    onError,
    onMessage(newData: T) {
      if (Meth.objectEquals(data.value, newData)) return;
      data.value = newData;
    },
  });
}

export function watchSSE<T>(
  endpoint: string,
  { onMessage, onError }: {
    onMessage?: (d: T) => void;
    onError?: () => void;
  },
) {
  const eventSource = new EventSource(endpoint);

  eventSource.onmessage = (event) => onMessage && onMessage(JSON.parse(event.data));
  eventSource.onerror = (_error) => onError && onError();

  globalThis.addEventListener('beforeunload', () => eventSource.close());

  return () => eventSource?.close();
}

export async function sendSSE<T>(endpoint: string, body: unknown) {
  return await fetchOrError<T>(endpoint, { method: 'POST', body });
}
