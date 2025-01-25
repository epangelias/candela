import { define } from '@/lib/utils/utils.ts';
// 
import { OramaClient } from "@oramacloud/client";

let client: OramaClient;

function getClient() {
    if (!client) return client = new OramaClient({
        endpoint: "https://cloud.orama.run/v1/indexes/bible-dpqd9u",
        api_key: Deno.env.get("ORAMA_API_KEY")!,
    });
    return client;
}




export const handler = define.handlers({
    POST: async (ctx) => {
        const { query } = await ctx.req.json();

        getClient();

        const resultsData = await client.search({
            term: query as string,
            mode: "vector",
        });

        console.log(resultsData)

        const results = resultsData?.hits.map(r => ({ name: r.document.verse_name, description: r.document.verse_text }))

        return Response.json(results);
    }
})