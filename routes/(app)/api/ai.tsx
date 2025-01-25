import { define } from '@/lib/utils/utils.ts';
import { AIMessage } from '@/lib/ai/oai.ts';
import { StreamAI } from '@/lib/stream/stream-ai.ts';
import { setUserData } from '@/lib/user/user-data.ts';
import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { getChatData, setChatData } from '@/app/chat-data.ts';

export const handler = define.handlers({
  GET: async (ctx) => {
    const user = ctx.state.user;

    if (!user) throw new HttpError(STATUS_CODE.Unauthorized);
    if (user.tokens <= 0 && !user.isSubscribed) throw new HttpError(STATUS_CODE.Unauthorized);
    const chatData = await getChatData(user);
    if (!chatData) throw new HttpError(STATUS_CODE.NotFound);

    const saveMessages = async (messages: AIMessage[]) => {
      await setChatData({ ...chatData, messages }, user.language);
      await setUserData(user.id, (u) => u.tokens--);
    };

    return StreamAI({
      messages: chatData.messages,
      onError: saveMessages,
      onCancel: saveMessages,
      onEnd: saveMessages,
    });
  },
});
