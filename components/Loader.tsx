import LoaderIcon from 'https://icons.church/svg-spinners/ring-resize';

export function Loader(props: any) {
  return <LoaderIcon {...props} class={`loader-icon ${props.class} ${props.className}`} />;
}
