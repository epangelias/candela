import { define } from '@/lib/utils/utils.ts';
import { TextMetadata } from '@/lib/texts-data.ts';

async function getTexts(language: string) {
  const texts = [];
  for await (const entry of await Deno.readDir('./texts/' + language)) {
    try {
      if (!entry.isDirectory) continue;
      const path = `./texts/${language}/${entry.name}/text.json`;
      const text = await Deno.readTextFile(path);
      const metadata = JSON.parse(text);
      metadata.folder = entry.name;
      texts.push(metadata);
    } catch (e) {
      console.error("Error reading text.json in " + entry.path, e);
    }
  }
  return texts as TextMetadata[];
}


export const handler = define.handlers({
  POST: async ctx => {
    try {
      const { language } = await ctx.req.json();
      const texts = await getTexts(language);
      return Response.json(texts);
    } catch (e) {
      console.error("Error loading texts", e);
      return Response.error();
    }
  }
})