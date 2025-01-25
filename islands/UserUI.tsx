import { useGlobal } from '@/islands/Global.tsx';
import { Field } from '@/components/Field.tsx';
import { Form } from '@/islands/Form.tsx';
import { FormButton } from '@/components/FormButton.tsx';
import { Content, getContent } from '@/islands/Content.tsx';

export function UserUI({ error, message }: { error?: string; message?: string }) {
  const global = useGlobal();

  return (
    <div class='user-ui'>
      <h1>
        <Content>Options</Content>
      </h1>
      {global.user.value?.hasSubscribed && global.stripeEnabled && (
        <p>
          <a href='/user/subscription' target='_blank'>Manage Subscription</a>
        </p>
      )}

      {!global.user.value?.isSubscribed && global.stripeEnabled && (
        <p>
          <a href='/user/pricing'>Subscribe</a>
        </p>
      )}

      {!global.user.value?.isEmailVerified && global.mailEnabled && (
        <p>
          Please verify your email address. <a href='/user/resend-email'>Resend email</a>
        </p>
      )}

      <Form method='POST' action='/user'>
        <Field name='name' label={getContent('Name')} required autofocus defaultValue={global.user.value?.name} />
        <Field name='email' label={getContent('Email')} required autofocus defaultValue={global.user.value?.email} />

        <div class='field'>
          <label for='field-language'>
            <Content>Language</Content>
          </label>
          <select name='language' id='field-language'>
            <option value='en'>English</option>
            <option value='es'>Español</option>
            <option value='la'>Latin</option>
          </select>
        </div>

        <FormButton class='wide'>{getContent('Save')}</FormButton>
        {message && <span class='message' role='status' aria-live='polite'>{message}</span>}
        {error && <span class='error-message' role='alert' aria-live='assertive'>{error}</span>}
      </Form>

      <p>
        <br />
        <a href='/user/signout'>{getContent('Sign Out')}</a>
      </p>
    </div>
  );
}
