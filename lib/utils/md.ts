import * as ammonia from 'https://deno.land/x/ammonia@0.3.1/mod.ts';
import { marked } from 'marked';

let waiting: void | true = true;

export async function renderMarkdown(input: string): Promise<string> {
  if (waiting) waiting = await ammonia.init();
  return ammonia.clean(await marked(input));
}
