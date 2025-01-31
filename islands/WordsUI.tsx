import { useSignal } from '@preact/signals';
import { sendSSE, syncSSE, watchSSE } from '@/lib/stream/stream-client.ts';
import { AIMessage } from '@/lib/ai/oai.ts';
import { useEffect, useRef } from 'preact/hooks';
import { useGlobal } from '@/islands/Global.tsx';
import { ChatData, WordsData } from '@/app/types.ts';
import { showOutOfTokensDialog } from '@/islands/OutOfTokensDialog.tsx';
import { delay } from '@std/async/delay';
import ArrowUp from 'tabler-icons/arrow-up';
import { useAlert } from '@/islands/Alert.tsx';
import { Loader } from '@/components/Loader.tsx';
import { getContent } from '@/islands/Content.tsx';
import IconAdd from 'tabler-icons/plus';
import { Field } from '@/components/Field.tsx';

export default function WordsUI({ data }: { data: WordsData }) {
  const global = useGlobal();
  const wordsData = useSignal<WordsData>(data);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const { showError, AlertBox } = useAlert();

  const checkCanGenerate = () => global.user.value && (global.user.value.tokens! > 0 || global.user.value.isSubscribed);

  if (!global.user.value) return <></>;

  useEffect(() => syncSSE('/api/wordsdata', { data: wordsData }), [global.user.value]);

  useEffect(() => {
    scrollToBottom(50);
  }, [wordsData.value]);

  useEffect(() => {
    if (
      global.pageState.currentTab.value?.id == 'chat' && global.pageState.selection.value &&
      !global.pageState.selectionUsed.value
    ) {
      global.pageState.selectionUsed.value = true;

      alert('Adding word ' + global.pageState.selection.value);
    }
  }, [global.pageState.currentTab.value]);

  async function scrollToBottom(maxDist = 0) {
    await delay(100);
    if (!scrollableRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollableRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (maxDist == 0 || distanceFromBottom <= maxDist) {
      scrollableRef.current.scrollTo(0, scrollHeight);
    }
  }

  return (
    <>
      <div class='words-ui'>
        <form style={{ flexDirection: 'row', padding: '10px' }}>
          <input name='word' placeholder='Word' />
          <input name='meaning' placeholder='Meaning' style={{ flex: '1' }} />
          <button>
            <IconAdd width={28} />
          </button>
        </form>
        <div className='scrollable' ref={scrollableRef}>
        </div>
      </div>

      <AlertBox />
    </>
  );
}
