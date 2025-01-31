import { define } from '@/lib/utils/utils.ts';
import { StreamSSR } from '@/lib/stream/stream-sse.ts';
import { db } from '@/lib/utils/utils.ts';
import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { WordsData } from '@/app/types.ts';

export const handler = define.handlers(async (ctx) => {
  if (!ctx.state.user) throw new HttpError(STATUS_CODE.Unauthorized);

  const path = ['words', ctx.state.user.id as string, ctx.state.user.language as string];

  if (ctx.req.method == 'GET') {
    return StreamSSR({ watchKey: path });
  } else if (ctx.req.method == 'POST') {
    const wordsDat = await ctx.req.json() as WordsData;
    await db.set(path, wordsDat);
    return Response.json({});
  } else {
    throw new HttpError(STATUS_CODE.MethodNotAllowed);
  }
});
