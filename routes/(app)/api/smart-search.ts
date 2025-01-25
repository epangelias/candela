import { define } from '@/lib/utils/utils.ts';
import { AIMessage, generateChatCompletion } from '@/lib/ai/oai.ts';
import { renderMarkdown } from '@/lib/utils/md.ts';

const firstReply = `### Matthew 12:38
Then certain of the scribes and of the Pharisees answered, saying, Master, we would see a sign from thee. 
But he answered and said unto them, An evil and adulterous generation seeketh after a sign; and there shall no sign be given to it, but the sign of the prophet Jonas: 
For as Jonas was three days and three nights in the whale's belly; so shall the Son of man be three days and three nights in the heart of the earth.

### Matthew 16:4
A wicked and adulterous generation seeketh after a sign; and there shall no sign be given unto it, but the sign of the prophet Jonas. And he left them, and departed.

### Luke 11:29
And when the people were gathered thick together, he began to say, This is an evil generation: they seek a sign; and there shall no sign be given it, but the sign of Jonas the prophet.
For as Jonas was a sign unto the Ninevites, so shall also the Son of man be to this generation.

### Luke 11:32
The men of Nineveh shall rise up in the judgment with this generation, and shall condemn it: for they repented at the preaching of Jonas; and, behold, a greater than Jonas is here.  `;

export const handler = define.handlers({
    POST: async (ctx) => {
        const { query } = await ctx.req.json();

        const messages: AIMessage[] = [
            { role: "system", content: "You are a AI bible search tool that provides relevant verses to a query strictly in a specific format. Respond in NOTHING else except for the verses in the specified format. For every query there is ALWAYS verses that can be helpful or aid in the question, concept, or topic presented in the query. ALWAYS provide relevant verses to any query that will provide insists, biblical knowledge and perspective on the query. Provide only the verses without any commentary or explanation, let the verses answer the query and respond strictly only with verses in the format with markdown h3 headings for the verse name and the verse text below. If you don't know what the query means, simply try your best to provide relevant verses." },
            { role: "user", content: 'Find verses with the query: "Sign of Jonah"' },
            { role: "system", content: firstReply },
            { role: "user", content: `Find verses with the query: "${query}"` }
        ];


        const result = await generateChatCompletion(undefined, messages);

        const content = result.choices[0].message.content!;

        const html = await renderMarkdown(content);

        return Response.json({ html: html });
    }
})