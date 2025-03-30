import { define } from '@/lib/utils/utils.ts';
import { AIMessage, generateChatCompletion } from '@/lib/ai/oai.ts';
import { BibleData, loadBible } from '@/lib/load-bible.ts';

const examplePrompts = [
    {
        query: "Sign of Jonah",
        text: `Matthew 12:38
Matthew 16:4
Luke 11:29
Luke 11:32`,
    },
    {
        query: "Creaturas",
        text: `Job 41:1
Isaiah 27:1
Job 40:15
Revelation 12:9
Isaiah 34:14
Isaiah 13:21
Isaiah 30:6
Revelation 13:1
Isaiah 14:29
Job 39:9`
    },
    {
        query: "Iphone",
        text: `1 Corinthians 6:12  
Proverbs 16:3  
Philippians 4:8  
1 John 2:15  
Galatians 5:13
1 Corinthians 10:31  
Proverbs 3:5  
Matthew 6:24  
Ecclesiastes 7:29`
    }
]

function getVerseText(bible: BibleData, verseName: string) {
    const [_, book, chapter, verse] = verseName.split(/(.+) (\d+):(\d+)/);
    const text = bible.books.find(b => b.name == book)
        ?.chapters.find(c => c.chapter == +chapter)
        ?.verses.find(v => v.verse == +verse)?.text;
    if (!text) console.log(bible.books.find(b => b.name == book)
        ?.chapters.find(c => c.chapter == +chapter)
        ?.verses.length, verseName)
    return text;
}


export const handler = define.handlers({
    POST: async (ctx) => {
        const { query } = await ctx.req.json();

        const randomExample = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];

        const messages: AIMessage[] = [
            { role: "system", content: "You are a AI bible search tool that provides relevant verses to a query strictly in a specified format with the plain text verse names in English separated by newlines without anything else. Only the verse name will be included with only ONE verse. Begin response with the first verse, then in the next line the verse after that until all the verses are there and the response is complete. For every query there is ALWAYS verses that can be helpful or aid in the question, concept, or topic presented in the query. ALWAYS provide relevant verses to any query no mater what it is, provide verses that will provide insists, biblical knowledge and perspective on the query. Provide only the verses relevant to the query without any commentary or explanation. If you don't understand the query, provide relevant verses no mater as best you can. Remember, ONLY provide the verse names of a SINGLE verse in english from only the new and old testament." },
            { role: "user", content: `Find verses with the query: "${randomExample.query}"` },
            { role: "assistant", content: randomExample.text },
            { role: "user", content: `Find verses with the query: "${query}"` }
        ];

        const _bible = loadBible(ctx.state.user?.language || 'en');

        const result = await generateChatCompletion(undefined, messages);

        let content = result.choices[0].message.content!;

        const thinking = content.match(/<think>([\s\S]*)<\/think>/)?.[1];
        const thinkingTag = `<small><details><summary style="float:right">Thinking &nbsp;</summary>${thinking}</details></small>`;

        content = content.replace(/<think>[\s\S]*<\/think>/, '');

        const bible = await _bible;

        const verses = content.split('\n').map(v => v.trim().split('-')[0]).filter(v => v !== '');

        const results = verses.map(v => `<h3>${v}</h3><p>${getVerseText(bible, v) || ''}</p>`).join('\n');

        return Response.json({ html: thinkingTag + results });
    }
})