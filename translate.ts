#!/usr/bin/env deno run --allow-net=api.openai.com --allow-write --allow-read --allow-env
import { getEnvironmentVarible, read, write } from './utils.ts';

const OPENAI_API_KEY = getEnvironmentVarible('OPENAI_API_KEY');
const REDUNDANCY = 10;
const LINES_PER_REQUEST = 100;

traslateSrtFile('captions.srt');

async function traslateSrtFile(filename: string) {
  const content = await read(filename);
  const lines = parseSrtFile(content);
  const result = [] as string[];

  write('input.json', lines);

  for (let i = 0; i < lines.length; i += LINES_PER_REQUEST) {
    const isFirst = i === 0;
    const chunk = lines
      .slice(isFirst ? i : i - REDUNDANCY, i + LINES_PER_REQUEST)
      .join('\n');

    console.warn('Translating lines', i, 'to', i + LINES_PER_REQUEST);
    const response = (await translate(chunk)).split('\n');
    result.push(...(isFirst ? response : response.slice(REDUNDANCY)));
  }

  write('output.json', result);
  console.log(result);
}

function parseSrtFile(content: string) {
  return content
    .split(/\n/)
    .map((x) => x.trim())
    .filter((x) => !/^\d+$/.test(x))
    .filter((x) => !x.includes('-->'))
    .filter(Boolean);
}

async function translate(text: string, lang = 'Spanish') {
  const response = await askGPT4(
    {
      role: 'system',
      content: `
You translate video scripts to ${lang}.
Keep the line breaks, the result should have exactly as many lines as the input.
      `.trim(),
    },
    { role: 'user', content: text },
    {
      role: 'assistant',
      content:
        "Okay, here is the caption file to Spanish. I've kept the line breaks so the result has the same number of line breaks as the original.",
    }
  );

  return response.choices[0].message.content;
}

async function askGPT4(
  ...messages: Message[]
): Promise<ChatCompletionResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
    }),
  });

  return response.json();
}

// Types

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
}

interface ChatCompletionResponse {
  choices: Choice[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface Choice {
  finish_reason: 'stop';
  index: number;
  message: Message;
}
