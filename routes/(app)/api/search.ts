import { define } from '@/lib/utils/utils.ts';
// 
import { OramaClient } from "@oramacloud/client";
import { loadBook } from '@/lib/load-bible.ts';

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

        const resultsData = [resultsDataVector?.hits, resultsDataText?.hits].flat().filter((x) => x !== undefined);;

        async function getVerseText(verseName: string) {
            const [_, _book, chapter, verse] = verseName.split(/(.+) (\d+):(\d+)/);

            let book = _book == "Revelation" ? "Revelation of John" : _book;
            if (book == "Song of Songs") book = "Song of Solomon";
            book = book.replace("1", "I");
            book = book.replace("2", "II");
            book = book.replace("3", "III");
            if (book == "Psalm") book = "Psalms";

            let bookData = await loadBook(ctx.state.user?.language, book);
            const text = bookData
                ?.chapters.find(c => c.chapter == +chapter)
                ?.verses.find(v => v.verse == +verse)?.text;

            if (!text) {
                bookData = await loadBook("en", book);
                return bookData
                    ?.chapters.find(c => c.chapter == +chapter)
                    ?.verses.find(v => v.verse == +verse)?.text || '';
            }

            return text || null;
        }

        const results = [];

        for (const r of resultsData) {
            const text = await getVerseText(r.document.verse_name);
            results.push({ name: r.document.verse_name, description: text });
        }

        return Response.json(results);
    }
})