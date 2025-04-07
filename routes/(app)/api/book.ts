import { define } from '@/lib/utils/utils.ts';
import { BookData } from '@/lib/texts-data.ts';

async function getBook(language: string, folder: string, book: string) {
  const path = `./texts/${language}/${folder}/books/${book}.json`;
  const text = await Deno.readTextFile(path);
  const data = JSON.parse(text);
  return data as BookData;
}


export const handler = define.handlers({
  POST: async ctx => {
    const { language, folder, book } = await ctx.req.json();
    console.log({ language, folder, book });
    const data = await getBook(language, folder, book);
    return Response.json(data);
  }
})