import { define } from '@/lib/utils/utils.ts';
import { Page } from '@/components/Page.tsx';
import IconShare2 from 'tabler-icons/share-2';

export default define.page(() => (
  <Page hideBanner={true}>
    <div>
      <ol>
        <li>
          Tab the share button <IconShare2 />
        </li>
        <li>Choose "Add to Home Screen"</li>
        <li>That's it!</li>
      </ol>
      <br />
      <img src='/img/guide-ios.webp' alt='' width={600} />
    </div>
  </Page>
));
