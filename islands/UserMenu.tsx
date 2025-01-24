import { useGlobal } from '@/islands/Global.tsx';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Meth } from '@/lib/utils/meth.ts';

export function UserMenu() {
  const global = useGlobal();
  const popover = useRef<HTMLDivElement>(null);
  const isOpen = useSignal(false);
  const name = Meth.limitText(global.user.value?.name?.split(' ')[0], 15);

  const checkPopoverState = () => {
    isOpen.value = !!popover.current?.matches(':popover-open');
  };
  useEffect(() => {
    popover.current?.addEventListener('toggle', checkPopoverState);
    return () => popover.current?.removeEventListener('toggle', checkPopoverState);
  }, [popover.current]);

  return (
    <>
      {global.user.value
        ? (
          <button class='trigger link' popovertarget='user-menu-dropdown'>
            {isOpen.value ? '▾' : '▸'} {name}
          </button>
        )
        : <a href='/user/signin'>Sign In</a>}
      {global.user.value && (
        <div popover ref={popover} class='dropdown' id='user-menu-dropdown'>
          <ul>
            <li>
              <a href='/user'>Settings</a>
            </li>
            <li>
              {!global.user.value?.isSubscribed && global.stripeEnabled && <a href='/user/pricing'>Subscribe</a>}
            </li>
            <li>
              <a href='/user/signout'>Sign Out</a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
