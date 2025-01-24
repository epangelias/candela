import { define } from '@/lib/utils/utils.ts';
import { Page } from '@/components/Page.tsx';

export default define.page(() => (
  <Page hideHeader={true} hideBanner={true}>
    <h1>Your Offline!</h1>
    <p>
      <a href='/'>Reload</a>
    </p>
  </Page>
));
