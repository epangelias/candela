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
}

export function SearchUI() {
  const searchResults = useSignal<SearchResult[]>([]);
  const smartSearchHTML = useSignal('');
  const loading = useSignal(false);
  const currentQuery = useSignal('');
  const global = useGlobal();

  useEffect(() => {
    if (IS_BROWSER) smartSearchHTML.value = `<p>${getContent('AskAndTheBibleAnswers', global)}</p>`;
  }, [global.user.value]);

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
      smartSearchHTML.value = '<p><div class="loader"></div></p>';

      searchResults.value = await fetchOrError('/api/search', {
        method: 'POST',
        body: { query },
      });

      smartSearchHTML.value = (await fetchOrError<{ html: string }>('/api/smart-search', {
        method: 'POST',
        body: { query },
      })).html;
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

  return (
    <div class='search-ui'>
      <form onSubmit={onSubmit}>
        <Field type='search' name='query' placeholder={getContent('Search')} required />
        <button disabled={loading.value}>
          {loading.value ? <Loader width={24} height={24} /> : <SearchIcon width={24} height={24} />}
        </button>
      </form>
      <div class='results'>
        {currentQuery.value && <h2>"{currentQuery.value}"</h2>}
        <div class='smart-search' dangerouslySetInnerHTML={{ __html: smartSearchHTML.value }}></div>
        <ul>
          {searchResults.value.map((result) => (
            <li>
              <h3>{result.name}</h3>
              <p>{result.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
