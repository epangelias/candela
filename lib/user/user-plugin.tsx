import { State } from '@/app/types.ts';
import { App } from 'fresh';
import { define } from '@/lib/utils/utils.ts';
import { getCookies } from '@std/http/cookie';
import { getUserByAuth } from '@/lib/user/user-data.ts';

export function userPlugin(app: App<State>) {
  app.use(async (ctx) => {
    // Skip static assets
    if (!ctx.req.url.includes('?__frsh_c=') && !ctx.req.url.includes('/_fresh')) {
      const { auth } = getCookies(ctx.req.headers);
      ctx.state.auth = auth;
      if (auth) {
        const user = await getUserByAuth(auth);
        if (user) ctx.state.user = user;
      }
    }
    return await ctx.next();
  });
}

export default define.page(() => <p>hi</p>);
