import { useComputed, useSignal } from '@preact/signals';
import { sendSSE, syncSSE } from '@/lib/stream/stream-client.ts';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useGlobal } from '@/islands/Global.tsx';
import { WordData, WordsData } from '@/app/types.ts';
import { delay } from '@std/async/delay';
import IconUnchecked from 'tabler-icons/square';
import IconChecked from 'tabler-icons/square-check-filled';
import IconTrash from 'tabler-icons/trash';
import { useAlert } from '@/islands/Alert.tsx';
import IconAdd from 'tabler-icons/plus';
import { generateCode } from '@/lib/utils/crypto.ts';
import { showOutOfTokensDialog } from '@/islands/OutOfTokensDialog.tsx';
import { Loader } from '@/components/Loader.tsx';

export default function WordsUI({ data }: { data: WordsData }) {
  const global = useGlobal();
  const wordsData = useSignal<WordsData>(data);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { showError, AlertBox } = useAlert();
  const selectedWords = useSignal<Set<string>>(new Set());
  const loading = useSignal(false);

  const checkCanGenerate = () => global.user.value && (global.user.value.tokens! > 0 || global.user.value.isSubscribed);

  if (!global.user.value) return <></>;

  useEffect(() => syncSSE('/api/wordsdata', { data: wordsData }), [global.user.value]);

  useEffect(() => {
    if (
      global.pageState.currentTab.value?.id == 'words' && global.pageState.selection.value &&
      !global.pageState.selectionUsed.value
    ) {
      global.pageState.selectionUsed.value = true;

      if (!formRef.current) return;
      formRef.current.reset();
      formRef.current.elements['word'].value = global.pageState.selection.value;
      (document.querySelector('[name="meaning"]') as HTMLInputElement)?.focus();
    }
  }, [global.pageState.currentTab.value]);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const word = formData.get('word') as string;
    const meaning = formData.get('meaning') as string;
    await addWord(word, meaning);
    form.reset();
    (document.querySelector('[name="word"]') as HTMLInputElement)?.focus();
  }

  async function addWord(word: string, meaning: string) {
    const newWord: WordData = {
      created: Date.now(),
      id: generateCode(),
      word,
      meaning,
      level: 0,
    };
    wordsData.value.words = [newWord, ...wordsData.value.words];
    wordsData.value = { ...wordsData.value };
    await sendSSE('/api/wordsdata', wordsData.value);
  }

  async function deleteWords() {
    try {
      if (!checkCanGenerate()) return showOutOfTokensDialog();
      loading.value = true;
      const ids = Array.from(selectedWords.value);
      if (!ids.length) return;
      wordsData.value.words = wordsData.value.words.filter((w) => !ids.includes(w.id));
      wordsData.value = { ...wordsData.value };
      await sendSSE('/api/wordsdata', wordsData.value);
      selectedWords.value = new Set();
    } catch (e) {
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function Word(word: WordData) {
    const selected = useMemo(() => selectedWords.value.has(word.id), [selectedWords.value]);

    function handleClick() {
      if (selected) selectedWords.value.delete(word.id);
      else selectedWords.value.add(word.id);
      selectedWords.value = new Set(selectedWords.value);
    }

    async function editWord() {
      const text = prompt('Edit Word', word.word);
      if (!text) return;
      word.word = text;
      wordsData.value = { ...wordsData.value };
      await sendSSE('/api/wordsdata', wordsData.value);
    }

    async function editMeaning() {
      const text = prompt('Edit Meaning', word.meaning);
      if (!text) return;
      word.meaning = text;
      wordsData.value = { ...wordsData.value };
      await sendSSE('/api/wordsdata', wordsData.value);
    }

    return (
      <li key={word.id} data-selected={selected}>
        <button class='icon' onClick={handleClick}>
          {selected ? <IconChecked width={24} height={24} /> : <IconUnchecked width={24} height={24} />}
        </button>
        <span class='word' onClick={editWord}>{word.word}</span>
        <span class='meaning' onClick={editMeaning}>{word.meaning}</span>
      </li>
    );
  }

  return (
    <>
      <div class='words-ui'>
        <form ref={formRef} onSubmit={onSubmit}>
          <input name='word' placeholder='Word' autocomplete='off' required />
          <input name='meaning' placeholder='Meaning' autocomplete='off' required />
          <button>
            <IconAdd width={28} />
          </button>
        </form>
        <div className='toolbar'>
          <button disabled={!selectedWords.value.size || loading.value} onClick={deleteWords} class='icon'>
            <IconTrash />
          </button>
          {loading.value && <Loader width={24} />}
        </div>
        <div className='words' ref={scrollableRef}>
          <ul>
            {wordsData.value.words.map(Word)}
          </ul>
        </div>
      </div>

      <AlertBox />
    </>
  );
}
