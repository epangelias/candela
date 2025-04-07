import { IS_BROWSER } from 'fresh/runtime';
import { useGlobal } from '@/islands/Global.tsx';
import { useEffect } from 'preact/hooks';
import { watchSSE } from '@/lib/stream/stream-client.ts';
import { AIMessage } from '@/lib/ai/oai.ts';
import { useSignal } from '@preact/signals';
import CaretUp from 'tabler-icons/caret-up-filled';

export function QuickUI() {
  const global = useGlobal();
  const generating = useSignal(false);
  const message = useSignal('');
  const stopGenerating = useSignal<null | (() => void)>(null);
  const lastChanged = useSignal(Date.now());
  const timeout = useSignal<null | number>(null);

  useEffect(() => {
    if (!global.pageState.selection.value) return;
    generating.value = false;
    message.value = '';
    stopGenerating.value?.();
    const timeDiff = Date.now() - lastChanged.value;
    lastChanged.value = Date.now();
    if (timeDiff > 500) {
      getResponse();
    } else {
      clearTimeout(timeout.value!);
      timeout.value = setTimeout(() => getResponse(), 500 - timeDiff);
    }
  }, [global.pageState.selection.value]);

  function getResponse() {
    generating.value = false;
    message.value = '';
    let currentSelection =
      `${global.pageState.selection.value} (context: '${global.pageState.selectionContext.value}')`;
    if (currentSelection.length > 1000) currentSelection = global.pageState.selection.value;
    if (currentSelection.length > 2000) return console.error('response too long');
    if (!global.pageState.selection.value) return;

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
    <div class='quick-ui'>
      <div class='content' dangerouslySetInnerHTML={{ __html: message.value || '<div class="loader"></div>' }}></div>
      <CaretUp height={24} />
    </div>
  );
}
