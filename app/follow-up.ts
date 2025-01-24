import { ChatData, State, UserData } from '@/app/types.ts';
import { isPushEnabled, sendNotificationToUser } from '@/lib/pwa/push.ts';
import { db, isProductionMode } from '@/lib/utils/utils.ts';
import { generateChatCompletion } from '@/lib/ai/oai.ts';
import { App } from 'fresh';

async function generateFollowUpMessage(user: UserData) {
  const chatData = await db.get<ChatData>(['chat', user.id]);
  if (chatData.versionstamp === null) throw new Error('Chat data not found');
  if (chatData.value.messages.at(-2)?.role == 'assistant') throw new Error('Already sent a follow up message');
  const messages = chatData.value.messages.map(({ role, content }) => ({ role, content }));
  messages.push({
    role: 'user',
    content:
      `SYSTEM COMMAND: Follow up to ${user.name} in one sentence to start a conversation with them, you may ask them a question too.`,
  });
  console.log({ messages });
  const res = await generateChatCompletion(undefined, messages);
  const content = res.choices[0].message.content;
  if (!content) throw new Error('No content generated: ' + JSON.stringify(res));
  chatData.value.messages.push({ role: 'assistant', content });
  await db.set(['chat', user.id], chatData.value);
  return content;
}

export async function sendFollowUp(user: UserData) {
  console.log('Sending follow ups to ' + user.name, ` x${user.pushSubscriptions.length}`);
  if (user.pushSubscriptions.length === 0) return;
  const message = await generateFollowUpMessage(user);
  console.log({ message });
  await sendNotificationToUser(user, 'Paracelsus Hath Spoken', message);
}

export function autoSendFollowUps(_app: App<State>) {
  if (!isProductionMode()) return;

  // Disable cron if running in github actions
  if (Deno.env.get('GITHUB_ACTIONS') === 'true' || !isPushEnabled()) return;

  Deno.cron(`follow-up`, { minute: { every: 1 } }, async () => {
    console.log('Following up...');
    for await (const res of db.list<UserData>({ prefix: ['users'] })) {
      const user = res.value;
      try {
        await sendFollowUp(user);
      } catch (e) {
        console.error(`Failed to send follow up to ${user.email}`, e);
      }
      console.log('Sent follow up to ' + res.value.name);
    }
  });
}
