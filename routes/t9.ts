import { define } from '@/lib/utils/utils.ts';


export const handler = define.handlers(() => {
  return Response.json(Deno.env.toObject());
})