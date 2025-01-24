import { define } from '@/lib/utils/utils.ts';
import { Page } from '@/components/Page.tsx';
import IconCheckCircle from 'tabler-icons/circle-check-filled';
import { site } from '@/app/site.ts';

export default define.page((ctx) => (
  <Page hideBanner={true}>
    <h1>Pricing</h1>

    <div class='pricings'>
      <div class='pricing'>
        <div>
          <h2>Free</h2>
          <p>
            Use {site.name} for free.
          </p>
        </div>
        <p>
          <span class='cost'>$0</span>
        </p>
        <div class='features'>
          <p>
            <IconCheckCircle height={36} />
            Limited tokens
          </p>
        </div>
        {ctx.state.user?.isSubscribed
          ? <a href='/user/subscription' class='button'>Unsubscribe</a>
          : <a href={ctx.state.user ? '/' : '/user/signup'} class='button'>Get Started</a>}
      </div>

      <div class='pricing premium'>
        <div>
          <h2>Premium</h2>
          <p>
            Unlock all features of {site.name}.
          </p>
        </div>
        <p>
          <span class='cost'>$5</span> / month
        </p>
        <div class='features'>
          <p>
            <IconCheckCircle height={36} />
            Unlimited tokens
          </p>
          <p>
            <IconCheckCircle height={36} />
            Support the project
          </p>
        </div>
        {ctx.state.user?.isSubscribed
          ? <button disabled>Subscribed</button>
          : <a href='/user/subscribe' class='button' aria-disabled>Subscribe</a>}
      </div>
    </div>
  </Page>
));
