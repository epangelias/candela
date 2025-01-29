import { define } from '@/lib/utils/utils.ts';
import { AIMessage, generateChatCompletion } from '@/lib/ai/oai.ts';
import { renderMarkdown } from '@/lib/utils/md.ts';

const examplePrompts = [
    {
        query: "Sign of Jonah",
        text: `### Matthew 12:38
Then certain of the scribes and of the Pharisees answered, saying, Master, we would see a sign from thee. 
But he answered and said unto them, An evil and adulterous generation seeketh after a sign; and there shall no sign be given to it, but the sign of the prophet Jonas: 
For as Jonas was three days and three nights in the whale's belly; so shall the Son of man be three days and three nights in the heart of the earth.

### Matthew 16:4
A wicked and adulterous generation seeketh after a sign; and there shall no sign be given unto it, but the sign of the prophet Jonas. And he left them, and departed.

### Luke 11:29
And when the people were gathered thick together, he began to say, This is an evil generation: they seek a sign; and there shall no sign be given it, but the sign of Jonas the prophet.
For as Jonas was a sign unto the Ninevites, so shall also the Son of man be to this generation.

### Luke 11:32
The men of Nineveh shall rise up in the judgment with this generation, and shall condemn it: for they repented at the preaching of Jonas; and, behold, a greater than Jonas is here.  `,
    },
    {
        query: "Creatures",
        text: `### Job 41:1
Canst thou draw out leviathan with an hook? or his tongue with a cord which thou lettest down?

### Isaiah 27:1
In that day the Lord with his sore and great and strong sword shall punish leviathan the piercing serpent, even leviathan that crooked serpent; and he shall slay the dragon that is in the sea.

### Job 40:15
Behold now behemoth, which I made with thee; he eateth grass as an ox.

### Revelation 12:9
And the great dragon was cast out, that old serpent, called the Devil, and Satan, which deceiveth the whole world: he was cast out into the earth, and his angels were cast out with him.

### Isaiah 34:14
The wild beasts of the desert shall also meet with the wild beasts of the island, and the satyr shall cry to his fellow; the screech owl also shall rest there, and find for herself a place of rest.

### Isaiah 13:21
But wild beasts of the desert shall lie there; and their houses shall be full of doleful creatures; and owls shall dwell there, and satyrs shall dance there.

### Isaiah 30:6
The burden of the beasts of the south: into the land of trouble and anguish, from whence come the young and old lion, the viper and fiery flying serpent, they will carry their riches upon the shoulders of young asses, and their treasures upon the bunches of camels, to a people that shall not profit them.

### Revelation 13:1
And I stood upon the sand of the sea, and saw a beast rise up out of the sea, having seven heads and ten horns, and upon his horns ten crowns, and upon his heads the name of blasphemy.

### Isaiah 14:29
Rejoice not thou, whole Palestina, because the rod of him that smote thee is broken: for out of the serpent's root shall come forth a cockatrice, and his fruit shall be a fiery flying serpent.

### Job 39:9
Will the unicorn be willing to serve thee, or abide by thy crib?`
    },
    {
        query: "Iphone",
        text: `### 1 Corinthians 6:12  
All things are lawful unto me, but all things are not expedient: all things are lawful for me, but I will not be brought under the power of any.  

### Proverbs 16:3  
Commit thy works unto the LORD, and thy thoughts shall be established.

### Philippians 4:8  
Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.  

### 1 John 2:15-17  
Love not the world, neither the things that are in the world. If any man love the world, the love of the Father is not in him. For all that is in the world, the lust of the flesh, and the lust of the eyes, and the pride of life, is not of the Father, but is of the world. And the world passeth away, and the lust thereof: but he that doeth the will of God abideth for ever.  

### Galatians 5:13
For, brethren, ye have been called unto liberty; only use not liberty for an occasion to the flesh, but by love serve one another.

### 1 Corinthians 10:31  
Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.  

### Proverbs 3:5-6  
Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.  

### Matthew 6:24  
No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon.  

### Ecclesiastes 7:29
Lo, this only have I found, that God hath made man upright; but they have sought out many inventions.`
    }
]

export const handler = define.handlers({
    POST: async (ctx) => {
        const { query } = await ctx.req.json();

        const randomExample = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];

        const messages: AIMessage[] = [
            { role: "system", content: "You are a AI bible search tool that provides relevant verses to a query strictly in a markdown format with an h3 (###) for the verse name in English as in the KJV, then the verse text exactly as in the KJV. BEGIN RESPONSE EXACTLY WITH \"###\" and continue with the first verse. Respond in NOTHING else except for the verses from the start of the response till the end. For every query there is ALWAYS verses that can be helpful or aid in the question, concept, or topic presented in the query. ALWAYS provide relevant verses to any query no mater what it is, provide verses that will provide insists, biblical knowledge and perspective on the query. Provide only the verses relevant to the query without any commentary or explanation. If you don't understand the query, provide relevant verses no mater as best you can. NEVER paraphrase the verses but quote the exact text." },
            { role: "user", content: `Find verses with the query: "${randomExample.query}"` },
            { role: "assistant", content: randomExample.text },
            { role: "user", content: `Find verses with the query: "${query}"` }
        ];


        const result = await generateChatCompletion(undefined, messages);

        const content = result.choices[0].message.content!;

        const html = await renderMarkdown(content);

        return Response.json({ html: html });
    }
})