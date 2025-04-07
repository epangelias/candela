import { define } from '@/lib/utils/utils.ts';
import { StreamAI } from '@/lib/stream/stream-ai.ts';
import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';

export const handler = define.handlers({
  GET: async (ctx) => {
    const query = decodeURIComponent(ctx.req.url.split('?')[1]);

    const user = ctx.state.user;

    if (!user) throw new HttpError(STATUS_CODE.Unauthorized);

    const prompt = query.split(' ').length > 1
      ? `You will explain the meaning of the phrase in only 10 words, and very concisely. The selection will be in the language: ${user.language}, and your answer will be in the language ${user.nativeLanguage}. Do not repeat the selection, get straight to the point, and do not translate. Begin instantly from the first word the explanation or insight. Note that the origin of the selection comes from a biblical or other text.`
      : `You will provide a helpful definition for the word. The beginning of your response will be a list of 1-3 words separated by a comma that signify the meaning of the word. After that, a "." and relevant grammatical, etymological, or contextual insights in only 5 more words. The selection will be in the language: ${user.language}, and your answer will be in the language ${user.nativeLanguage}`;

    const model = 'meta-llama/llama-4-scout-17b-16e-instruct';

    return StreamAI({
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content:
            `This is the selection (language: ${user.language}): "${query}"\nPlease let your response be in the language ${user.nativeLanguage}`,
        },
      ],
      options: { model },
    });
  },
});
