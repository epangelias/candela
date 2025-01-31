import { db } from '@/lib/utils/utils.ts';
import { ChatData, UserData } from '@/app/types.ts';
import { LANGUAGES } from "@/lib/utils/lang.ts";

const createSystemPrompt = (name: string, langCode: string) => {
  const translation = LANGUAGES[langCode].defaultTranslation;
  const language = LANGUAGES[langCode].name;
  return `Thou art Candela, a guide to those who seek the truth of holy scripture and the light of divine truth. Speak only in the ${language} tongue, if the user speaks in another tongue, respond with their inquiry translated into ${language}, and they answer in ${language} and in ${language} ALONE. You may provide the user with a summary at the end in the language of his inquiry when it differs from ${language}. Thy purpose is to illuminate the path of understanding for *${name}*, a seeker of righteousness. What *${name} may ask, thou art to do, thou servant.
    Speak as a teacher rooted in the Word of God, quoting scripture when possible, using the ${translation} in ${language} for all references. Let thy counsel draw from the psalms, proverbs, parables, and teachings of Christ to provide clarity and guidance. Thou art not the light itself, but a humble guide to its source, thou Candela, fulfilling the scripture: "Thy word is a lamp unto my feet, and a light unto my path." Provide in depth responses to deep questions, however briefly to simple inquires.`;
};

const createFirstMessage = (name: string, language: string) => {
  const messages: Record<string, string> = {
    en: `Come forth, ${name}, and ask your question. Together, we will seek the truth through the Word of God.`,
    es: `Ven, ${name}, y haz tu pregunta. Juntos buscaremos la verdad a través de la Palabra de Dios.`,
    la: `Veni, ${name}, et quaestionem tuam propone. Simul veritatem per Verbum Dei quaeremus.`,
    he: `בוא, ${name}, ושאל את שאלתך. יחד נחפש את האמת דרך דבר האלוהים.`,
    gr: `Έλα, ${name}, και κάνε την ερώτησή σου. Μαζί θα αναζητήσουμε την αλήθεια μέσω του Λόγου του Θεού.`
  };

  return messages[language] || messages.en; // Default to English if language is not recognized
};


export async function getChatData(user: UserData) {
  const lang = user.language || 'en';
  const path = ['chat', user.id, lang];
  const data = await db.get<ChatData>(path);
  if (data.versionstamp == null) {
    const chatData: ChatData = {
      userId: user.id,
      messages: [
        { role: 'system', content: createSystemPrompt(user.name, lang) },
        { role: 'assistant', content: createFirstMessage(user.name, lang) },
      ],
    };
    await db.set(path, chatData);
    return chatData;
  }
  return data.value;
}

export async function setChatData(chatData: ChatData, language: string) {
  return await db.set(['chat', chatData.userId, language], chatData);
}
