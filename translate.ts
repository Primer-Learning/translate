#!/usr/bin/env deno run --allow-net=api.openai.com --allow-write --allow-read --allow-env

import { gpt } from './gpt.ts';
import { read, write } from './utils.ts';

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
  return (
    content
      .split(/\n/)
      // remove whitespace at start and end of lines
      .map((x) => x.trim())
      // remove lines that only contain digits
      .filter((x) => !/^\d+$/.test(x))
      // remove lines that contain '-->' (timestamp lines)
      .filter((x) => !x.includes('-->'))
      // remove empty lines
      //   this means "convert the strings to booleans and filter out the false ones"
      //   is the same as .filter(line => Boolean(line)) or .filter(line => !!line)
      .filter(Boolean)
  );
}

async function translate(text: string, lang = 'Spanish') {
  const response = await gpt(
    'gpt-4',
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
