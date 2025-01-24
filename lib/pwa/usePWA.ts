import { Meth } from '@/lib/utils/meth.ts';
import { fetchOrError } from '@/lib/utils/fetch.ts';
import { asset, IS_BROWSER } from 'fresh/runtime';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';

export async function requestPushSubscription(worker?: ServiceWorkerRegistration | null) {
  console.log('Requesting subscription...');

  if (!worker) return null;

  if (Notification.permission == 'denied') return null;

  const existingSubscription = await worker.pushManager.getSubscription();
  if (existingSubscription) return existingSubscription;

  const vapidPublicKey = await fetchOrError('/api/vapid-public-key') as string;
  console.log('Loaded VAPID key: ', vapidPublicKey);
  const convertedVapidKey = Meth.urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await worker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  console.log('Subscribed.', subscription);

  await fetchOrError('/api/subscribe-notifications', { method: 'POST', body: { subscription } });

  return subscription;
}

export async function getSubscription(worker: ServiceWorkerRegistration | null) {
  if (!worker) return null;
  // if (Notification.permission !== 'granted') null;
  const sub = await worker.pushManager.getSubscription();
  if (sub) console.log('Loaded subscription');
  else console.log('No subscription');
  return sub;
}

export async function loadServiceWorker() {
  if ('serviceWorker' in navigator == false) {
    console.warn('Service Worker Disabled');
    return null;
  }

  let registration = await navigator.serviceWorker.getRegistration();

  const workerURL = asset('/worker.js');
  const scriptURL = registration?.active?.scriptURL!;
  const _oldWorkerURL = scriptURL ? new URL(scriptURL) : undefined;
  // Remove domain so can compare urls
  // Need to fix so that the notifications re-register when the worker changes
  const oldWorkerURL = _oldWorkerURL?.pathname! + _oldWorkerURL?.search;

  if (!registration || oldWorkerURL != workerURL) {
    console.log({ oldWorkerURL, workerURL });
    console.log('Unloading and loading service worker');
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) subscription.unsubscribe();
      const unregistered = await registration.unregister();
      if (!unregistered) throw new Error('Failed to unregister service worker');
      else console.log('Service worker unregistered');
    }
    registration = await navigator.serviceWorker.register(workerURL, { scope: '/' });
    return null;
  }

  return registration;
}

export function isIOSSafari(): boolean {
  const userAgent = globalThis.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  return isIOS && isSafari;
}

function detectIsPWA(): boolean {
  return IS_BROWSER && globalThis.matchMedia('(display-mode: standalone)').matches;
}

export function usePWA() {
  const installPWA = useSignal<() => void>();
  const isPWA = useSignal(false);
  const worker = useSignal<ServiceWorkerRegistration | null>(null);
  const pushSubscription = useSignal<PushSubscription | null>(null);

  useEffect(() => {
    globalThis.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();

      const deferredPrompt = e as Event & { prompt: () => void; userChoice: Promise<void> };

      installPWA.value = async () => {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log(choice);
      };
    });

    globalThis.matchMedia('(display-mode: standalone)')
      .addEventListener('change', () => isPWA.value = detectIsPWA());

    isPWA.value = detectIsPWA();

    (async () => {
      worker.value = await loadServiceWorker();
      pushSubscription.value = await getSubscription(worker.value);
    })();
  }, []);

  return {
    isPWA,
    installPWA,
    worker,
    pushSubscription,

    async requestSubscription() {
      // Disallow recreating push subscription, causes old to expire
      if (pushSubscription.value) return pushSubscription.value;
      return pushSubscription.value = await requestPushSubscription(worker.value);
    },
  };
}
