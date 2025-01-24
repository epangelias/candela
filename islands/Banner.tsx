import { IS_BROWSER } from 'fresh/runtime';
import { useGlobal } from '@/islands/Global.tsx';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { BannerData } from '@/app/types.ts';
import { createBannerData } from '@/app/banners.tsx';

export function Banners() {
  const global = useGlobal();
  const banner = useSignal<BannerData>();

  const banners = createBannerData(global);

  // This is to prevent banner jumping after pwa signals change
  const ready = useSignal(false);
  setTimeout(() => ready.value = true, 1000);

  useEffect(() => {
    const currentBanner = localStorage.getItem('currentBanner');
    if (currentBanner && !ready.value) {
      banner.value = banners.find((b) => b.name === currentBanner);
    } else if (ready.value) {
      banner.value = banners.find((b) => b.condition());
      if (banner.value) {
        localStorage.setItem('currentBanner', banner.value.name);
      } else {
        localStorage.removeItem('currentBanner');
      }
    }
  }, [
    global.pwa.installPWA.value,
    global.pwa.isPWA.value,
    global.outOfTokens.value,
    global.pwa.pushSubscription.value,
    global.pwa.worker.value,
    global.user.value,
    ready.value,
  ]);

  if (!banner.value || !IS_BROWSER) return <></>;

  return <Banner banner={banner.value} />;
}

function Banner(
  { banner }: { banner: BannerData },
) {
  if (!banner || !IS_BROWSER) return <></>;

  const hideBanner = useSignal(true);

  hideBanner.value = localStorage.getItem('hideBanner-' + banner.name) === 'true';

  function onClose(e: Event) {
    e.stopPropagation();
    localStorage.setItem('hideBanner-' + banner.name, 'true');
    hideBanner.value = true;
  }

  function onOpen() {
    localStorage.removeItem('hideBanner-' + banner.name);
    hideBanner.value = false;
  }

  return (
    <>
      <button
        class='banner-closed-button'
        onClick={onOpen}
        data-hide={!hideBanner.value}
        aria-label='Open Banner'
      >
        <span>!</span>
      </button>
      <div class='banner' role='status' aria-live='polite' data-hide={hideBanner.value}>
        {banner.content()}
        {banner.canClose && <button onClick={onClose} aria-label='Close' class='close'></button>}
      </div>
    </>
  );
}
