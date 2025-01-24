import { db } from '@/lib/utils/utils.ts';

interface Options {
  watchKey?: Deno.KvKey;
  onChunk?: (send: (s: unknown) => void) => void;
  onCancel?: () => void;
}

export function StreamSSR({ onChunk, onCancel, watchKey }: Options) {
  const stream = new ReadableStream({
    start: async (controller) => {
      const send = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(new TextEncoder().encode(message));
        } catch (e) {
          controller.error(e);
        }
      };

      try {
        if (onChunk) await onChunk(send);
      } catch (e) {
        console.error(e);
        controller.error(e);
      }

      if (watchKey) {
        for await (const event of db.watch([watchKey])) {
          if (event[0].versionstamp === null) continue;
          send(event[0].value);
        }
      }
    },
    cancel: onCancel,
  });

  const headers = new Headers({ 'Content-Type': 'text/event-stream' });
  return new Response(stream, { headers });
}
