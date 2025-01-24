import { ComponentChildren, JSX } from 'preact';

type Props = {
  children: ComponentChildren;
} & JSX.InputHTMLAttributes<HTMLInputElement>;
export function Dialog(props: Props) {
  function onClick(event: MouseEvent) {
    const dialog = event.target as HTMLDialogElement;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInDialog && dialog?.close) dialog.close();
  }

  return (
    <dialog onClick={onClick} id={props.id} class={props.class}>
      <form method='dialog'>
        <button class='close'></button>
      </form>
      {props.children}
    </dialog>
  );
}
