import { Field } from '@/components/Field.tsx';
import SearchIcon from 'tabler-icons/search';
import { useSignal } from '@preact/signals';
import { fetchOrError } from '@/lib/utils/fetch.ts';
import { Loader } from '@/components/Loader.tsx';

interface SearchResult {
  name: string;
  description: string;
}

export function SearchUI() {
  const searchResults = useSignal<SearchResult[]>([]);
  const loading = useSignal(false);

  async function onSubmit(e: SubmitEvent) {
    try {
      e.preventDefault();

      const form = e.currentTarget as HTMLFormElement;

      const formData = new FormData(form);
      const query = formData.get('query');

      loading.value = true;

      form.reset();

      searchResults.value = [];

      searchResults.value = await fetchOrError('/api/search', {
        method: 'POST',
        body: { query },
      });
    } catch (e) {
    } finally {
      loading.value = false;
    }
  }

  return (
    <div class='search-ui'>
      <form onSubmit={onSubmit}>
        <Field type='search' name='query' placeholder='Search' required />
        <button disabled={loading.value}>
          {loading.value ? <Loader width={24} height={24} /> : <SearchIcon width={24} height={24} />}
        </button>
      </form>
      <ul>
        {searchResults.value.map((result) => (
          <li>
            <h3>{result.name}</h3>
            <p>{result.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
