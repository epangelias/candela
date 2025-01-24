import { define } from '@/lib/utils/utils.ts';
import { Page } from '@/components/Page.tsx';
import { Field } from '@/components/Field.tsx';
import { HttpError, page } from 'fresh';
import { Meth } from '@/lib/utils/meth.ts';
import { getUserById, getUserIdByEmail } from '@/lib/user/user-data.ts';
import { STATUS_CODE } from '@std/http/status';
import { sendPasswordVerification } from '@/app/email.ts';
import { isMailEnabled } from '@/lib/mail/mail.ts';

export const handler = define.handlers({
  POST: async (ctx) => {
    if (!isMailEnabled()) throw new HttpError(STATUS_CODE.NotFound);
    const { email } = Meth.formDataToObject(await ctx.req.formData());
    const userId = await getUserIdByEmail(email);
    if (!userId) throw new HttpError(STATUS_CODE.NotFound, 'User not found');
    const user = await getUserById(userId);
    if (!user) throw new HttpError(STATUS_CODE.NotFound, 'User not found');
    await sendPasswordVerification(ctx.url.origin, user);
    return page({ message: 'Email sent!' });
  },
});

export default define.page<typeof handler>(({ data }) => (
  <Page>
    <h1>Lost your password?</h1>
    <p>
      We'll send you an email with instructions on how to reset your password.
    </p>
    {data?.message ? <p>{data.message}</p> : (
      <form method='post'>
        <Field name='email' type='email' label='Email' required />
        <button type='submit'>Send</button>
      </form>
    )}
  </Page>
));
