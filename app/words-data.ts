import { db } from '@/lib/utils/utils.ts';
import { UserData, WordsData } from '@/app/types.ts';
import { generateCode } from '@/lib/utils/crypto.ts';

export async function getWordsData(user: UserData) {
  const lang = user.language || 'en';
  const path = ['words', user.id, lang];
  const data = await db.get<WordsData>(path);
  const wordsData: WordsData = {
    id: generateCode(),
    created: Date.now(),
    language: lang,
    words: [],
    userId: user.id,
  }
  if (data.versionstamp == null) {
    await db.set(path, wordsData);
    return wordsData;
  }
  return data.value;
}

export async function setWordsData(wordData: WordsData) {
  return await db.set(['words', wordData.userId, wordData.language], wordData);
}
