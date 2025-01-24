import { define } from '@/lib/utils/utils.ts';
import { STATUS_CODE, STATUS_TEXT, StatusCode } from '@std/http/status';
import { HttpError, page } from 'fresh';
import { Page } from '@/components/Page.tsx';

export const handler = define.handlers((ctx) => {
  const isAPI = !!ctx.url.pathname.match(/^\/api\//) || ctx.req.headers.get('accept') === 'text/plain';

  try {
    const e = ctx.error;
    if (e instanceof HttpError) throw e;
    else if (typeof e === 'string') {
      console.error(e);
      throw new HttpError(STATUS_CODE.InternalServerError);
    } else if (e instanceof Error) {
      console.error(e);
      throw new HttpError(STATUS_CODE.InternalServerError);
    } else {
      console.error(e);
      throw new HttpError(STATUS_CODE.NotFound);
    }
  } catch (e) {
    const { status, message } = e as HttpError;
    if (isAPI) {
      return new Response(message, { statusText: STATUS_TEXT[status as StatusCode], status });
    }
    if (status == STATUS_CODE.Unauthorized) return ctx.redirect('/user/signin');
    return page({ status, statusText: message });
  }
});

export default define.page((ctx) => {
  return (
    <Page>
      <h1>{(ctx.data as unknown as { statusText: string }).statusText}</h1>
      <p>
        <a href='/'>Go Back</a>
      </p>
    </Page>
  );
});
