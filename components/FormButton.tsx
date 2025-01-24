import { JSX } from 'preact';
import { Loader } from '@/components/Loader.tsx';

export function FormButton(props: JSX.ButtonHTMLAttributes) {
  return (
    <button {...props} class={'form-button ' + props.class + ' ' + props.className}>
      {props.children} <Loader />
    </button>
  );
}
