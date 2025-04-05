import { IS_BROWSER } from 'fresh/runtime';
import { useGlobal } from '@/islands/Global.tsx';
import { useEffect } from 'preact/hooks';
import { watchSSE } from '@/lib/stream/stream-client.ts';
import { AIMessage } from '@/lib/ai/oai.ts';
import { useSignal } from '@preact/signals';

export function QuickUI() {
  const global = useGlobal();
  const generating = useSignal(false);
  const message = useSignal('');
  const stopGenerating = useSignal<null | (() => void)>(null);

  useEffect(() => {
    getResponse();
  }, [global.pageState.selection.value]);

  function getResponse() {
    const currentSelection = global.pageState.selection.value;
    generating.value = false;
    message.value = '';

    if (!currentSelection) return;

    stopGenerating.value?.();
    stopGenerating.value = watchSSE('/api/quick-explain?' + currentSelection, {
      onMessage(newMessage: AIMessage) {
        if (newMessage == null) return generating.value = false;
        message.value = newMessage.content;
      },
      onError() {
        console.error('Error generating response');
        message.value = '';
        generating.value = false;
      },
    });
  }

  if (!IS_BROWSER || !global.pageState.selection.value) return <></>;

  return (
    <div class='quick-ui' dangerouslySetInnerHTML={{ __html: message.value || '<div class="loader"></div>' }}></div>
  );
}
