import { fetchOrError } from '@/lib/utils/fetch.ts';
import { useGlobal } from '@/islands/Global.tsx';
import { BookData, TextMetadata } from '@/lib/texts-data.ts';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import IconBack from 'tabler-icons/arrow-left';
import { IS_BROWSER } from 'fresh/runtime';
import { Loader } from '@/components/Loader.tsx';

export function TextsUI() {
  if (!IS_BROWSER) return <></>;

  const global = useGlobal();
  const texts = useSignal<TextMetadata[]>([]);
  const filter = useSignal<string>('');
  const currentView = useSignal<number>((+localStorage.getItem('texts-currentView')!) || 0);
  const currentText = useSignal<TextMetadata | null>(null);
  const currentBook = useSignal<string | null>(localStorage.getItem('texts-currentBook') || null);
  const bookData = useSignal<BookData | null>(null);
  const currentChapter = useSignal<string | null>(null);

  async function loadTexts() {
    const language = global.user.value?.language;

    texts.value = await fetchOrError<TextMetadata[]>('/api/texts', {
      method: 'POST',
      body: { language },
    });

    currentText.value = texts.value.find((text) => text.textId === localStorage.getItem('texts-currentText')) || null;
  }

  async function loadBookData() {
    if (!currentBook.value || !currentText.value) return;
    const language = global.user.value?.language;
    bookData.value = await fetchOrError<BookData>('/api/book', {
      method: 'POST',
      body: { language, folder: currentText.value.folder, book: currentBook.value },
    });

    if (!currentChapter.value) viewChapter(bookData.value?.chapters[0].name);
  }

  function searchText(text: TextMetadata) {
    return text.versionName.toLowerCase().includes(filter.value.toLowerCase()) ||
      text.description.toLowerCase().includes(filter.value.toLowerCase());
  }

  function openText(text: TextMetadata) {
    currentText.value = text;
    currentView.value = 1;
  }

  function openBook(book: BookData) {
    currentView.value = 2;
    if (bookData.value?.name !== book.name) bookData.value = null;
    currentBook.value = book.name;

    scrollToTop();
  }

  function scrollToTop() {
    const interval = setInterval(() => {
      const element = document.querySelector('.book-content.scroll');
      if (element) {
        element.scrollTo({ top: 0 });
        clearInterval(interval);
      }
    }, 100);
  }

  function viewChapter(chapter: string) {
    currentChapter.value = chapter;
    localStorage.setItem('texts-currentChapter', chapter);
    const interval = setInterval(() => {
      const element = document.getElementById(chapter);
      if (element) {
        clearInterval(interval);
        element.scrollIntoView();
      }
    }, 100);
  }

  function viewVerse(verse: string) {
    const interval = setInterval(() => {
      const element = document.getElementById(verse);
      if (element) {
        clearInterval(interval);
        const el = (verse.split(':')[1] == '1') ? element.parentElement!.previousSibling : element.previousSibling!;
        el.scrollIntoView();
      }
    }, 150);
  }

  function onChapterScroll(e: Event) {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    const chapters = bookData.value?.chapters || [];
    for (const chapter of chapters) {
      const element = document.getElementById(chapter.name);
      if (element && (element.offsetTop + element.offsetHeight - globalThis.innerHeight / 2) > scrollTop) {
        currentChapter.value = chapter.name;
        localStorage.setItem('texts-currentChapter', chapter.name);
        const select = document.querySelector('#chapter-select') as HTMLSelectElement;
        if (select) select.value = chapter.name;
        break;
      }
    }
  }

  useEffect(() => {
    loadTexts();
  }, [global.user.value?.language]);

  useEffect(() => {
    localStorage.setItem('texts-currentView', currentView.value.toString());
    if (currentText.value?.textId) localStorage.setItem('texts-currentText', currentText.value?.textId || '');
    localStorage.setItem('texts-currentBook', currentBook.value || '');
  }, [currentView.value, currentText.value]);

  useEffect(() => {
    loadBookData();
  }, [currentBook.value, currentText.value]);

  useEffect(() => {
    (async () => {
      if (currentView.value != 2) return;
      if (!bookData.value) await loadBookData();
      const chapter = localStorage.getItem('texts-currentChapter');
      if (chapter) viewChapter(chapter);
    })();
  }, []);

  useEffect(() => {
    openVerse(global.pageState.selectedVerse.value);
  }, [global.pageState.selectedVerse.value]);

  async function openVerse(name: string) {
    if (!name) return;
    let book = name.split(' ').slice(0, -1).join(' ');
    const chapter = name.split(' ').at(-1)!.split(':')[0];

    const text = texts.value.find((t) => t.folder == 'bible');
    if (!text) return console.error('text not found');
    openText(text);
    currentBook.value = book;
    await loadBookData();
    viewChapter(book + ' ' + chapter);
    currentView.value = 2;
    viewVerse(name);
    console.log(name);
  }

  return (
    <div class='texts-ui'>
      <div class='texts-list' data-hidden={!!currentView.value}>
        <div className='toolbar'>
        </div>

        <input
          type='search'
          value={filter.value}
          placeholder='Search'
          onInput={(e) => filter.value = (e.target as HTMLInputElement).value}
        />
        <div class='texts scroll'>
          {texts.value.filter(searchText).map((text) => (
            <div
              key={text.textId}
              class='text-item'
              onClick={() => openText(text)}
            >
              <h3>{text.versionName}</h3>
              <p>{text.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div class='text' data-hidden={currentView.value !== 1}>
        <div className='toolbar'>
          <button class='back' onClick={() => currentView.value = 0}>
            <IconBack width={24} />
          </button>
          <h1>{currentText.value?.versionName}</h1>
          <div></div>
        </div>
        <div class='text-content scroll'>
          <h3>{currentText.value?.versionName}</h3>
          <p>{currentText.value?.description}</p>
          <div class='books'>
            {currentText.value?.books.map((book) => (
              <div
                class='book'
                onClick={() => openBook(book as unknown as BookData)}
                key={book.name}
              >
                <h3>
                  {book.name} <span class='chapters'>{book.chapters}</span>
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class='book-item' data-hidden={currentView.value !== 2}>
        <div className='toolbar'>
          <button onClick={() => currentView.value = 1} class='back'>
            <IconBack width={24} />
          </button>
          <select onInput={(e) => viewChapter((e.target as HTMLSelectElement).value)} id='chapter-select'>
            {bookData.value?.chapters.map((chapter) => (
              <option
                key={chapter.name}
                value={chapter.name}
                selected={currentChapter.value === chapter.name}
              >
                {chapter.chapter}
              </option>
            ))}
          </select>
        </div>

        {!bookData.value && (
          <div className='load'>
            <Loader width={24} />
          </div>
        )}

        <div class='book-content scroll' onScroll={onChapterScroll}>
          <div class='chapters'>
            {bookData.value?.chapters.map((chapter) => (
              <div className='chapter' key={chapter.name} id={chapter.name}>
                <h3>{chapter.name}</h3>
                <div className='verses' data-title={`${bookData.value?.name} ${chapter.name}`}>
                  {chapter.verses.map((verse) => (
                    <p
                      class='verse'
                      data-title={`${bookData.value?.name} ${verse.name}`}
                      data-selected={verse.name === global.pageState.selectedVerse.value}
                      id={verse.name}
                    >
                      <span class='verse-number'>{verse.verse}</span> {verse.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
