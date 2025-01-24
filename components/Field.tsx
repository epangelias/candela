import { JSX } from 'preact';

export function Field(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & { label?: string },
) {
  return (
    <div class='field'>
      {props.label && <label for={`field-${props.name}`}>{props.label}</label>}
      <input
        key={`field-${props.name}`}
        type={props.type || 'text'}
        id={`field-${props.name}`}
        autocomplete={props.autocomplete || props.autoComplete || 'off'}
        {...props}
      />
    </div>
  );
}
