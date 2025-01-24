import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import InfoIcon from 'tabler-icons/alert-circle-filled';

interface AlertInfo {
  message: string;
  type: 'error' | 'success';
  id?: number;
}

export function Alert({ message, type, id }: AlertInfo) {
  const hide = useSignal(false);

  useEffect(() => {
    hide.value = false;

    const timer = setTimeout(() => {
      hide.value = true;
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, type, id]);

  return (
    <div
      popover='auto'
      class={`alert ${type}`}
      role='alert'
      aria-live='assertive'
      aria-atomic='true'
      data-hide={hide.value}
    >
      <InfoIcon height='16' aria-hidden='true' />
      <p id={`alert-${id}`}>{message}</p>
    </div>
  );
}

export function useAlert() {
  const alertInfo = useSignal<AlertInfo | null>(null);

  const AlertBox = () =>
    alertInfo.value && <Alert message={alertInfo.value.message} type={alertInfo.value.type} id={Math.random()} />;

  return {
    AlertBox,
    showError(message: string) {
      alertInfo.value = { message: message, type: 'error' };
    },
    showSuccess(message: string) {
      alertInfo.value = { message: message, type: 'success' };
    },
    hideAlert() {
      alertInfo.value = null;
    },
  };
}
