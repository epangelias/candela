import { define } from '@/lib/utils/utils.ts';
import { HttpError } from 'https://jsr.io/@fresh/core/2.0.0-alpha.25/src/error.ts';
import { page } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { Page } from '@/components/Page.tsx';
import { sendEmailVerification } from '@/app/email.ts';
import { isMailEnabled } from '@/lib/mail/mail.ts';

export const handler = define.handlers({
  GET: async (ctx) => {
    if (!isMailEnabled()) throw new HttpError(STATUS_CODE.NotFound);
    if (!ctx.state.user || ctx.state.user.isEmailVerified) {
      throw new HttpError(STATUS_CODE.Unauthorized);
    }
    await sendEmailVerification(ctx.url.origin, ctx.state.user);
    return page();
  },
});

export default define.page(() => (
  <Page>
    <h1>Sent verification link to your email!</h1>
    <p>
      <a href='/'>Go to homepage</a>
    </p>
  </Page>
));
