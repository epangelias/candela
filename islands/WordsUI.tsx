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
import { generateCode } from '@/lib/utils/crypto.ts';

export default function WordsUI({ data }: { data: WordsData }) {
  const global = useGlobal();
  const wordsData = useSignal<WordsData>(data);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { showError, AlertBox } = useAlert();

  const checkCanGenerate = () => global.user.value && (global.user.value.tokens! > 0 || global.user.value.isSubscribed);

  if (!global.user.value) return <></>;

  useEffect(() => syncSSE('/api/wordsdata', { data: wordsData }), [global.user.value]);

  useEffect(() => {
    scrollToBottom(50);
  }, [wordsData.value]);

  useEffect(() => {
    if (
      global.pageState.currentTab.value?.id == 'words' && global.pageState.selection.value &&
      !global.pageState.selectionUsed.value
    ) {
      global.pageState.selectionUsed.value = true;

      if (!formRef.current) return;
      formRef.current.reset();
      formRef.current.elements['word'].value = global.pageState.selection.value;
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

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const word = formData.get('word') as string;
    const meaning = formData.get('meaning') as string;
    await addWord(word, meaning);
    form.reset();
  }

  async function addWord(word: string, meaning: string) {
    wordsData.value.words.push({
      created: Date.now(),
      id: generateCode(),
      word,
      meaning,
      level: 0,
    });
    wordsData.value = { ...wordsData.value };
    await sendSSE('/api/wordsdata', wordsData.value);
    scrollToBottom();
  }

  return (
    <>
      <div class='words-ui'>
        <form style={{ flexDirection: 'row', padding: '10px' }} ref={formRef} onSubmit={onSubmit}>
          <input name='word' placeholder='Word' autocomplete='off' required />
          <input name='meaning' placeholder='Meaning' style={{ flex: '1' }} autocomplete='off' required />
          <button>
            <IconAdd width={28} />
          </button>
        </form>
        <div className='scrollable' ref={scrollableRef}>
          <ul>
            {wordsData.value.words.map((word) => (
              <li key={word.word} key={word.id}>
                <span>{word.word}</span>
                <span>{word.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AlertBox />
    </>
  );
}
