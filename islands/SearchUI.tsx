import { Field } from '@/components/Field.tsx';
import SearchIcon from 'tabler-icons/search';
import { useSignal } from '@preact/signals';
import { fetchOrError } from '@/lib/utils/fetch.ts';
import { Loader } from '@/components/Loader.tsx';
import { getContent } from '@/islands/Content.tsx';
import { useEffect } from 'preact/hooks';
import { useGlobal } from '@/islands/Global.tsx';
import { IS_BROWSER } from 'fresh/runtime';

interface SearchResult {
  name: string;
  description: string;
  smart?: true;
}

export function SearchUI() {
  const searchResults = useSignal<SearchResult[]>([]);
  const loading = useSignal(false);
  const currentQuery = useSignal('');
  const global = useGlobal();
  const thinkingTagContent = useSignal('');

  useEffect(() => {
    if (
      global.pageState.currentTab.value?.id == 'search' && global.pageState.selection.value &&
      !global.pageState.selectionUsed.value
    ) {
      global.pageState.selectionUsed.value = true;
      search(global.pageState.selection.value);
    }
  }, [global.pageState.currentTab.value]);

  async function search(query: string) {
    try {
      currentQuery.value = query;

      loading.value = true;

      searchResults.value = [];
      thinkingTagContent.value = '';

      searchResults.value = await fetchOrError('/api/search', {
        method: 'POST',
        body: { query },
      });

      const { data, thinkingTag } = await fetchOrError<{ data: SearchResult[] }>('/api/smart-search', {
        method: 'POST',
        body: { query },
      });

      thinkingTagContent.value = thinkingTag;

      searchResults.value = searchResults.value.filter((s) => !data.find((d) => d.name === s.name));
      searchResults.value = [...data, ...searchResults.value];
    } catch (e) {
    } finally {
      loading.value = false;
    }
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    const formData = new FormData(form);
    const query = formData.get('query') as string;

    form.reset();

    await search(query);
  }

  function openVerse(name: string) {
    global.pageState.currentTabId.value = 2;
    global.pageState.selectedVerse.value = name;
  }

  return (
    <div class='search-ui'>
      <form onSubmit={onSubmit}>
        <Field type='search' name='query' placeholder={getContent('Search')} required />
        <button disabled={loading.value}>
          {loading.value ? <Loader width={24} height={24} /> : <SearchIcon width={20} height={20} />}
        </button>
      </form>
      <div class='results'>
        {currentQuery.value && <h2>"{currentQuery.value}" {loading.value && <Loader width={24} height={24} />}</h2>}
        {!searchResults.value.length && getContent('AskAndTheBibleAnswers', global)}
        <ul>
          {searchResults.value.map((result) => (
            <li
              data-smart={!!result.smart}
              onClick={() => openVerse(result.name)}
              tabIndex={0}
              key={result.name}
            >
              <h3>{result.name}</h3>
              <p>{result.description}</p>
            </li>
          ))}
        </ul>
        <p dangerouslySetInnerHTML={{ __html: thinkingTagContent.value }}></p>
      </div>
    </div>
  );
}
