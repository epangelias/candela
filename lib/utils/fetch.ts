export async function fetchOrError<T>(
  url: string,
  init?: { method: 'POST' | 'PATCH'; body: unknown } | { method: 'DELETE' },
): Promise<T> {
  const body = init
    ? {
      method: init.method,
      body: 'body' in init ? JSON.stringify(init.body) : undefined,
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
    }
    : undefined;

  const res = await fetch(url, body);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  return await res.json();
}
