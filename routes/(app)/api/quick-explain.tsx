import { define } from '@/lib/utils/utils.ts';
import { StreamAI } from '@/lib/stream/stream-ai.ts';
import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { getLanguageName } from '@/lib/utils/lang.ts';

export const handler = define.handlers({
  GET: async (ctx) => {
    const query = decodeURIComponent(ctx.req.url.split('?')[1]);
    const word = query.split(" (context: '")[0];
    const isWord = word.split(' ').filter((q) => q.trim()).length > 1;

    const user = ctx.state.user;

    if (!user) throw new HttpError(STATUS_CODE.Unauthorized);

    const nativeLanguage = user.nativeLanguage ? getLanguageName(user.nativeLanguage) : 'en';
    const appLanguage = user.language ? getLanguageName(user.language) : 'en';

    const prompt = isWord
      ? `You will explain the meaning of the phrase in only 15 words, and very concisely. The selection will be in the language: ${appLanguage}, and your answer will be in the language ${nativeLanguage}. Do not repeat the selection, get straight to the point, and do not translate. Begin instantly from the first word the explanation or insight. Note that the origin of the selection comes from a biblical or other text.`
      : `You will provide a helpful definition for the word under 15 words. The beginning of your response will be a list of 1-3 words separated by a comma that signify the meaning of the word. The context of the word may also be provided. After that, it will be followed by relevant contextual insights in no more than 10 more words, avoid mundane obvious facts but include scholarly insight that is not inherit in the text. The selection will be in the language: ${appLanguage}, and your answer will be in the language ${nativeLanguage}`;

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
            `This is the selection (language: ${user.language}): "${word}"\n${query}\nPlease let your response be in the language ${user.nativeLanguage}`,
        },
      ],
      options: { model, max_tokens: 100 },
    });
  },
});
