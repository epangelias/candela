import { BannerData, GlobalData } from '@/app/types.ts';
import { isIOSSafari } from '@/lib/pwa/usePWA.ts';

export function createBannerData(global: GlobalData): BannerData[] {
  return [
    {
      name: 'verify-email',
      condition: () => !global.user.value?.hasVerifiedEmail && global.outOfTokens.value && global.mailEnabled,
      canClose: false,
      content: () => (
        <>
          <a href='/user/resend-email'>Verify email</a> for more tokens
        </>
      ),
    },
    {
      name: 'subscribe',
      condition: () => global.user.value?.hasVerifiedEmail && global.outOfTokens.value && global.stripeEnabled,
      canClose: true,
      content: () => (
        <>
          <a href='/user/pricing'>Subscribe</a> for unlimited tokens
        </>
      ),
    },
    {
      name: 'ios-install',
      condition: () => !global.pwa.isPWA.value && isIOSSafari(),
      canClose: true,
      content: () => <a href='/user/install-guide-ios'>Install this app to your device</a>,
    },
    {
      name: 'pwa-install',
      condition: () => global.pwa.installPWA.value && !global.pwa.isPWA.value && !isIOSSafari(),
      canClose: true,
      content: () => (
        <button class='link' onClick={global.pwa.installPWA.value}>
          Install this app to your device
        </button>
      ),
    },
  ];
}
