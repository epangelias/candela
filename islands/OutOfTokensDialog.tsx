import { useGlobal } from '@/islands/Global.tsx';
import { Dialog } from '@/islands/Dialog.tsx';

export function OutOfTokensDialog() {
  const global = useGlobal();

  return (
    <Dialog id='out-of-tokens-dialog'>
      <h2>You are out of tokens!</h2>
      {global.user.value?.isSubscribed || !global.user.value?.hasVerifiedEmail && global.mailEnabled
        ? (
          <p>
            Please verify your email address to receive more tokens. <a href='/user/resend-email'>Resend email</a>
          </p>
        )
        : global.stripeEnabled && (
          <p>
            Subscribe for unlimited tokens. <a href='/user/pricing'>Subscribe</a>
          </p>
        )}
    </Dialog>
  );
}

export function showOutOfTokensDialog() {
  const dialog = document.getElementById('out-of-tokens-dialog') as HTMLDialogElement;
  dialog?.showModal();
}
