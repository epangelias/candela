import { define } from '@/lib/utils/utils.ts';
import { HttpError } from 'fresh';
import { authorizeUser, setAuthCookie } from '@/lib/user/user-data.ts';
import { Meth } from '@/lib/utils/meth.ts';
import { Page } from '@/components/Page.tsx';
import { RateLimiter } from '@/lib/utils/rate-limiter.ts';
import { isMailEnabled } from '@/lib/mail/mail.ts';
import { Field } from '@/components/Field.tsx';
import { Form } from '@/islands/Form.tsx';
import { FormButton } from '@/components/FormButton.tsx';

const limiter = new RateLimiter();

export const handler = define.handlers({
  POST: async (ctx) => {
    limiter.request();

    const { email, password } = Meth.formDataToObject(await ctx.req.formData());

    const authCode = await authorizeUser(email, password);
    if (authCode) return setAuthCookie(ctx, authCode);

    throw new HttpError(400, 'Invalid credentials');
  },
});

export default define.page<typeof handler>(() => (
  <Page hideHeader={true} hideBanner={true}>
    <div>
      <h1>Sign In</h1>
      <Form method='POST'>
        <Field name='email' type='email' label='Email' required autofocus />
        <Field name='password' type='password' label='Password' required />

        <FormButton class='wide'>Sign In</FormButton>
        <a href='/user/signup' class='wide'>Sign Up</a>
        {isMailEnabled() && (
          <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>
            <a href='/user/lost-password'>Lost your password?</a>
          </p>
        )}
      </Form>
    </div>
  </Page>
));
