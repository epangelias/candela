import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Stream } from 'openai/streaming.ts';
import { LruCache } from 'jsr:@std/cache';

export interface AIMessage {
  role: string;
  content: string;
  html?: string;
}

export interface OAIOptions {
  baseURL?: string;
  apiKey?: string;
  model: string;
}

const cache = new LruCache<string, OpenAI>(100);

const defaultTestOptions: OAIOptions = {
  model: Deno.env.get('OPENAI_MODEL') || '4o-mini',
  baseURL: Deno.env.get('OPENAI_API_BASE'),
  apiKey: Deno.env.get('OPENAI_API_KEY'),
};

export async function generateChatCompletionStream(
  options: OAIOptions = defaultTestOptions,
  messages: AIMessage[],
) {
  return await generateChatCompletion(options, messages, true) as unknown as Stream<
    OpenAI.ChatCompletionChunk
  >;
}

export async function generateChatCompletion(
  options: OAIOptions = defaultTestOptions,
  messages: AIMessage[],
  stream = false,
) {
  messages = messages.map(({ role, content }) => ({ role, content }));

  const backendId = `${options.baseURL}:${options.apiKey}`;

  const backend = cache.has(backendId) ? cache.get(backendId)! : cache.set(
    backendId,
    new OpenAI({ baseURL: options.baseURL, apiKey: options.apiKey }),
  ).get(backendId)!;

  return await backend.chat.completions.create({
    model: options.model,
    messages: messages as ChatCompletionMessageParam[],
    stream,
  }) as unknown as OpenAI.ChatCompletion;
}
