import { useContext, useEffect } from 'preact/hooks';
import { createContext } from 'preact';
import { ComponentChildren } from 'preact';
import { GlobalData, UserData } from '@/app/types.ts';
import { useComputed, useSignal } from '@preact/signals';
import { syncSSE } from '@/lib/stream/stream-client.ts';
import { usePWA } from '@/lib/pwa/usePWA.ts';
import { PageState } from '@/app/SelectionState.tsx';

interface Props {
  children: ComponentChildren;
  user: Partial<UserData> | null;
  mailEnabled: boolean;
  stripeEnabled: boolean;
  pushEnabled: boolean;
}

export function Global({ children, user, mailEnabled, stripeEnabled, pushEnabled }: Props) {
  const global: GlobalData = {
    user: useSignal(user),
    outOfTokens: useComputed(() => global.user.value?.tokens! <= 0 && !global.user.value?.isSubscribed),
    pwa: usePWA(),
    mailEnabled,
    stripeEnabled,
    pushEnabled,
    pageState: new PageState(),
  };

  // Synchronize user data with server
  if (user) useEffect(() => syncSSE('/api/userdata', { data: global.user }), []);

  useEffect(() => {
    const setSelection = () => {
      const selection = globalThis.getSelection()?.toString() || '';
      if (selection != global.pageState.selection.value) {
        global.pageState.selectionUsed.value = false;
        global.pageState.selection.value = selection;
      }
    };
    document.addEventListener('selectionchange', setSelection);
    return () => document.removeEventListener('selectionchange', setSelection);
  });

  function unregisterPushWhenLoggedOut() {
    if (global.pwa.worker.value && global.pwa.pushSubscription.value && !global.user.value) {
      global.pwa.pushSubscription.value.unsubscribe();
    }
  }

  useEffect(unregisterPushWhenLoggedOut, [
    global.pwa.pushSubscription.value,
    global.user.value,
    global.pwa.worker.value,
  ]);

  return <GlobalContext.Provider value={global}>{children}</GlobalContext.Provider>;
}

const GlobalContext = createContext<GlobalData | null>(null);

export const useGlobal = () => useContext(GlobalContext) as GlobalData;
