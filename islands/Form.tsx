// ./repos/paracelsus/islands/Form.tsx
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import { useAlert } from '@/islands/Alert.tsx';

export function Form(props: JSX.HTMLAttributes<HTMLFormElement> & { method?: string; action: string }) {
  const isLoading = useSignal(false);
  const { showError, showSuccess, hideAlert, AlertBox } = useAlert();

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    if (isLoading.value) return;

    const form = e.currentTarget;
    isLoading.value = true;

    hideAlert();

    const buttons = form.querySelectorAll('button');
    buttons.forEach((button) => (button.disabled = true));

    try {
      const formData = new FormData(form);
      const method = (form.method || 'get').toLowerCase();
      let url = form.action || globalThis.location.href;

      let res;
      if (method === 'get') {
        const params = new URLSearchParams(formData as unknown as string);
        url = `${url}${url.includes('?') ? '&' : '?'}${params}`;
        res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
        });
      } else {
        res = await fetch(url, {
          method,
          body: formData,
          headers: {
            'Accept': 'text/plain',
          },
        });
      }

      if (!res.ok && !res.redirected) {
        showError(await res.text());
        return;
      }

      if (res.redirected) {
        globalThis.location.href = res.url;
      } else if (method === 'get') {
        globalThis.location.href = url;
      }

      const text = await res.text();

      if (text && !res.redirected) showSuccess(text);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      isLoading.value = false;
      buttons.forEach((button) => (button.disabled = false));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} data-loading={isLoading.value} {...props}>
        {props.children}
      </form>
      <AlertBox />
    </>
  );
}
