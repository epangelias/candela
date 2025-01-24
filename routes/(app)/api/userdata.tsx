import { define } from '@/lib/utils/utils.ts';
import { StreamSSR } from '@/lib/stream/stream-sse.ts';
import { db } from '@/lib/utils/utils.ts';
import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { stripUserData } from '@/app/user.ts';
import { UserData } from '@/app/types.ts';

export const handler = define.handlers((ctx) => {
  if (!ctx.state.user || !ctx.state.auth) throw new HttpError(STATUS_CODE.Unauthorized);

  const key: Deno.KvKey = ['users', ctx.state.user!.id];

  return StreamSSR({
    async onChunk(send) {
      for await (const [user] of db.watch<[UserData]>([key])) {
        if (user.versionstamp === null) continue;
        send(stripUserData(user.value));
      }
    },
  });
});
