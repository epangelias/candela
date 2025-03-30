import { define } from '@/lib/utils/utils.ts';
// 
import { OramaClient } from "@oramacloud/client";
import { loadBible } from '@/lib/load-bible.ts';
import { rawListeners } from 'node:process';

let client: OramaClient;

function getClient() {
    if (!client) return client = new OramaClient({
        endpoint: "https://cloud.orama.run/v1/indexes/bible-dpqd9u",
        api_key: Deno.env.get("ORAMA_API_KEY")!,
    });
    return client;
}

if (Deno.env.get('GITHUB_ACTIONS') !== "true") getClient();



export const handler = define.handlers({
    POST: async (ctx) => {

        const _bible = loadBible(ctx.state.user?.language || 'en');

        const { query } = await ctx.req.json();

        getClient();

        const prompt = `The verse that is most relevant to the query "${query}"`;

        const resultsDataVector = await client.search({
            term: prompt,
            mode: "vector",
        });

        const resultsDataText = await client.search({
            term: prompt,
            mode: "fulltext",
        });

        const bible = await _bible;

        const resultsData = [resultsDataVector?.hits, resultsDataText?.hits].flat().filter((x) => x !== undefined);;

        function getVerseText(verseName: string) {
            const [_, book, chapter, verse] = verseName.split(/(.+) (\d+):(\d+)/);
            const text = bible.books.find(b => b.name == book)
                ?.chapters.find(c => c.chapter == +chapter)
                ?.verses.find(v => v.verse == +verse)?.text;
            if (!text) console.log(bible.books.find(b => b.name == book)
                ?.chapters.find(c => c.chapter == +chapter)
                ?.verses.length, verseName)
            return text;
        }

        const results = resultsData.map(r => ({ name: r.document.verse_name, description: getVerseText(r.document.verse_name) }))

        return Response.json(results);
    }
})