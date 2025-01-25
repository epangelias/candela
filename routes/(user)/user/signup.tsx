import { define } from '@/lib/utils/utils.ts';
import { HttpError } from 'fresh';
import { authorizeUser, setAuthCookie } from '@/lib/user/user-data.ts';
import { Meth } from '@/lib/utils/meth.ts';
import { Page } from '@/components/Page.tsx';
import { RateLimiter } from '@/lib/utils/rate-limiter.ts';
import { sendEmailVerification } from '@/app/email.ts';
import { createUser } from '@/app/user.ts';
import { Field } from '@/components/Field.tsx';
import { Form } from '@/islands/Form.tsx';
import { FormButton } from '@/components/FormButton.tsx';
import { SelectLanguage } from '@/islands/Content.tsx';

const HAS_SIGN_UP_CODE = Deno.env.has('SIGN_UP_CODE');
const SIGN_UP_CODE = Deno.env.get('SIGN_UP_CODE');

const limiter = new RateLimiter();

export const handler = define.handlers({
  POST: async (ctx) => {
    limiter.request();

    const { name, email, password, signupCode } = Meth.formDataToObject(await ctx.req.formData());

    try {
      const correctCode = HAS_SIGN_UP_CODE && signupCode && signupCode == SIGN_UP_CODE;
      if (signupCode && !correctCode) throw new Error('Invalid sign up code');

      const user = await createUser(name, email, password, !!correctCode);

      try {
        await sendEmailVerification(ctx.url.origin, user);
      } catch (e) {
        // Do nothing if rate limited
        console.error('Error sending verification email: ', e);
      }

      const authCode = await authorizeUser(email, password);
      if (authCode) return setAuthCookie(ctx, authCode);

      throw new Error('Error authorizing user');
    } catch (e) {
      throw new HttpError(400, Meth.getErrorMessage(e));
    }
  },
});

export default define.page<typeof handler>(() => (
  <Page hideHeader={true} hideBanner={true}>
    <div>
      <h1>Sign Up</h1>
      <Form method='POST'>
        <Field name='name' label='Name' required autofocus />
        <Field name='email' label='Email' type='email' required />
        <Field name='password' label='Password' type='password' required />

        {HAS_SIGN_UP_CODE && (
          <details>
            <summary>Do you have a sign up code?</summary>
            <Field name='signupCode' type='text' label='Sign Up Code' />
          </details>
        )}

        <FormButton class='wide'>Sign Up</FormButton>
        <a class='wide' href='/user/signin'>Sign In</a>
      </Form>
    </div>
  </Page>
));
