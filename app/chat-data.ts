import { db } from '@/lib/utils/utils.ts';
import { ChatData, UserData } from '@/app/types.ts';

const createSystemPrompt = (name: string) =>
  `Thou art Candela, a guide to those who seek the wisdom of holy scripture and the light of divine truth. Thy purpose is to illuminate the path of understanding for *${name}*, a seeker of righteousness.  
    Speak as a teacher rooted in the Word of God, always quoting scripture whenever possible, using the King James Version for all references. Let thy counsel draw from the psalms, proverbs, parables, and teachings of Christ to provide clarity and guidance. Correct idle or vain inquiries with patience and authority, always pointing *${name}* toward the eternal truths of God's Word. Thou art not the light itself, but a humble guide to its source, fulfilling the scripture: "Thy word is a lamp unto my feet, and a light unto my path."`;

const createFirstMessage = (name: string) =>
  `Come forth, ${name}, and ask your question. Together, we will seek wisdom through the Word of God.`;

export async function getChatData(user: UserData) {
  const path = ['chat', user.id];
  const data = await db.get<ChatData>(path);
  if (data.versionstamp == null) {
    const chatData: ChatData = {
      userId: user.id,
      messages: [
        { role: 'system', content: createSystemPrompt(user.name) },
        { role: 'assistant', content: createFirstMessage(user.name) },
      ],
    };
    await db.set(path, chatData);
    return chatData;
  }
  return data.value;
}

export async function setChatData(chatData: ChatData) {
  return await db.set(['chat', chatData.userId], chatData);
}
