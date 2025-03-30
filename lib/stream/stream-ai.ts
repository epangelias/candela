import { StreamSSR } from '@/lib/stream/stream-sse.ts';
import { ChatCompletionChunk } from 'https://deno.land/x/openai@v4.28.0/resources/mod.ts';
import { Stream } from 'https://deno.land/x/openai@v4.28.0/streaming.ts';
import { AIMessage, OAIOptions } from '@/lib/ai/oai.ts';
import { generateChatCompletionStream } from '@/lib/ai/oai.ts';
import { renderMarkdown } from '@/lib/utils/md.ts';

interface Options {
  messages: AIMessage[];
  options?: OAIOptions;
  onChunk?: (messages: AIMessage[]) => void;
  onEnd?: (messages: AIMessage[]) => void;
  onError?: (messages: AIMessage[]) => void;
  onCancel?: (messages: AIMessage[]) => void;
}

function removeThinkTags(input: string): string {
  if (input.includes('<think>') && !input.includes('</think>')) {
    const seconds = new Date().getSeconds();
    const mod = seconds % 4;
    const dots = [".", "..", "...", ""][mod];
    return `Thinking${dots}`;
  }
  return input.replace(/<think>[\s\S]*?<\/think>/g, '');
}

export function StreamAI({ messages, options, onChunk, onEnd, onCancel }: Options) {
  let stream: Stream<ChatCompletionChunk>;

  const message = { role: 'assistant', content: '', html: '' };

  const trigger = async (fn?: (msgs: AIMessage[]) => void) => {
    try {
      if (fn) await fn(messages);
    } catch (e) {
      // Prevents server crashing
      console.error(e);
    }
  };

  return StreamSSR({
    async onChunk(send) {
      stream = await generateChatCompletionStream(options, messages);
      if (stream.controller instanceof AbortController == false) throw new Error('Invalid stream');
      await trigger(onChunk);

      let content = '';

      messages.push(message);

      for await (const token of stream) {
        const deltaContent = token.choices[0].delta.content;
        if (typeof deltaContent == 'undefined') break;
        content += deltaContent;
        const html = insertLoaderToHTML(await renderMarkdown(removeThinkTags(content)));
        message.content = content;
        message.html = html;
        send(message);
      }

      message.html = await renderMarkdown(removeThinkTags(content));
      send(message);
      stream.controller.abort();
      send(null);
      await trigger(onEnd);
    },
    async onCancel() {
      message.html = await renderMarkdown(removeThinkTags(message.content));
      await trigger(onCancel);
      stream?.controller?.abort();
    },
  });
}

function insertLoaderToHTML(html: string) {
  return html.replace(/<\/([^>]+)>\n+$/, `&nbsp;&nbsp;<span class="loader"></span></$1>`);
}
