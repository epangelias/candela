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
import IconArrowUp from 'tabler-icons/arrow-up';
import IconArrowDown from 'tabler-icons/arrow-down';
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
  const wordsDataSorted = useMemo(() => wordsData.value.words.sort((a, b) => a.level - b.level), [wordsData.value]);

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
    (document.querySelector('[name="word"]') as HTMLInputElement)?.focus();
    await addWord(word, meaning);
    form.reset();
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
      loading.value = true;
      const ids = Array.from(selectedWords.value);
      if (!ids.length) return;
      wordsData.value.words = wordsData.value.words.filter((w) => !ids.includes(w.id));
      wordsData.value = { ...wordsData.value };
      selectedWords.value = new Set();
      await sendSSE('/api/wordsdata', wordsData.value);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      loading.value = false;
    }
  }

  async function promoteWords() {
    try {
      loading.value = true;
      const ids = Array.from(selectedWords.value);
      if (!ids.length) return;
      wordsData.value.words = wordsData.value.words.map((w) => {
        if (ids.includes(w.id)) w.level++;
        return w;
      });
      wordsData.value = { ...wordsData.value };
      selectedWords.value = new Set();
      await sendSSE('/api/wordsdata', wordsData.value);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      loading.value = false;
    }
  }

  async function demoteWords() {
    try {
      loading.value = true;
      const ids = Array.from(selectedWords.value);
      if (!ids.length) return;
      wordsData.value.words = wordsData.value.words.map((w) => {
        if (ids.includes(w.id)) w.level--;
        return w;
      });
      wordsData.value = { ...wordsData.value };
      selectedWords.value = new Set();
      await sendSSE('/api/wordsdata', wordsData.value);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      loading.value = false;
    }
  }

  function toggleMainCheck() {
    if (selectedWords.value.size) selectedWords.value = new Set();
    else selectedWords.value = new Set(wordsData.value.words.map((w) => w.id));
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

    const hideWord = word.level % 2 == 0 && word.level != 0 && !selected;
    const hideMeaning = word.level % 2 == 1 && !selected;

    return (
      <li key={word.id} data-selected={selected}>
        <button class='icon' onClick={handleClick}>
          {selected ? <IconChecked width={24} height={24} /> : <IconUnchecked width={24} height={24} />}
        </button>
        <span class='word' onClick={editWord} data-hide={hideWord}>{word.word}</span>
        <span class='meaning' onClick={editMeaning} data-hide={hideMeaning}>{word.meaning}</span>
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
          <button class='icon' onClick={toggleMainCheck} data-selected={!!selectedWords.value.size}>
            {selectedWords.value.size
              ? <IconChecked width={24} height={24} />
              : <IconUnchecked width={24} height={24} />}
          </button>
          <button disabled={!selectedWords.value.size || loading.value} onClick={demoteWords} class='icon'>
            <IconArrowUp width={28} />
            <span>Promote</span>
          </button>
          <button disabled={!selectedWords.value.size || loading.value} onClick={promoteWords} class='icon'>
            <IconArrowDown width={28} />
            <span>Demote</span>
          </button>
          <button disabled={!selectedWords.value.size || loading.value} onClick={deleteWords} class='icon'>
            <IconTrash width={28} />
            <span>Delete</span>
          </button>
          {loading.value && <Loader width={24} />}
        </div>
        <div className='words' ref={scrollableRef}>
          <ul>
            {wordsDataSorted.map(Word)}
          </ul>
        </div>
      </div>

      <AlertBox />
    </>
  );
}
