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
  const lastChanged = useSignal(Date.now());
  const timeout = useSignal<null | number>(null);

  useEffect(() => {
    generating.value = false;
    message.value = '';
    stopGenerating.value?.();
    const timeDiff = Date.now() - lastChanged.value;
    lastChanged.value = Date.now();
    if (timeDiff > 500) timeout.value = setTimeout(() => getResponse(), timeDiff);
  }, [global.pageState.selection.value]);

  function getResponse() {
    clearTimeout(timeout.value!);
    generating.value = false;
    message.value = '';
    let currentSelection = `"${global.pageState.selection.value}" in "${global.pageState.selectionContext.value}"`;
    if (currentSelection.length > 1000) currentSelection = global.pageState.selection.value;
    if (currentSelection.length > 2000) return;

    if (!currentSelection) return;

    console.log(currentSelection);

    stopGenerating.value?.();
    try {
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
    } catch (_e) {
      console.error('Error generating response', _e);
      message.value = '';
      generating.value = false;
    }
  }

  if (!IS_BROWSER || !global.pageState.selection.value) return <></>;

  return (
    <div class='quick-ui' dangerouslySetInnerHTML={{ __html: message.value || '<div class="loader"></div>' }}></div>
  );
}
