import { Header } from '@/islands/Header.tsx';
import { ComponentChildren } from 'preact';
import { Banners } from '@/islands/Banner.tsx';

export function Page(
  props: { children: ComponentChildren; hideHeader?: boolean; hideBanner?: boolean; fullWidth?: boolean },
) {
  return (
    <div class='container'>
      {/* {!props.hideHeader && <Header />} */}
      {!props.hideBanner && <Banners />}
      <div class='scrollable'>
        <main class={props.fullWidth ? '' : 'centered'}>{props.children}</main>
      </div>
    </div>
  );
}
