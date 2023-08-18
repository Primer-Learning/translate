import { getEnvironmentVarible } from './utils.ts';

const OPENAI_API_KEY = getEnvironmentVarible('OPENAI_API_KEY');

export async function gpt(
  model: GptModel,
  ...messages: Message[]
): Promise<ChatCompletionResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
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

type GptModel =
  | 'text-davinci-001'
  | 'text-search-curie-query-001'
  | 'davinci'
  | 'text-babbage-001'
  | 'curie-instruct-beta'
  | 'text-davinci-003'
  | 'davinci-similarity'
  | 'code-davinci-edit-001'
  | 'text-similarity-curie-001'
  | 'text-embedding-ada-002'
  | 'ada-code-search-text'
  | 'text-search-ada-query-001'
  | 'gpt-4-0314'
  | 'babbage-search-query'
  | 'ada-similarity'
  | 'gpt-3.5-turbo'
  | 'gpt-4-0613'
  | 'text-search-ada-doc-001'
  | 'text-search-babbage-query-001'
  | 'code-search-ada-code-001'
  | 'curie-search-document'
  | 'text-search-davinci-query-001'
  | 'text-search-curie-doc-001'
  | 'babbage-search-document'
  | 'babbage-code-search-text'
  | 'davinci-instruct-beta'
  | 'davinci-search-query'
  | 'text-similarity-babbage-001'
  | 'text-davinci-002'
  | 'code-search-babbage-text-001'
  | 'babbage'
  | 'text-search-davinci-doc-001'
  | 'code-search-ada-text-001'
  | 'ada-search-query'
  | 'text-similarity-ada-001'
  | 'whisper-1'
  | 'gpt-4'
  | 'ada-code-search-code'
  | 'ada'
  | 'text-davinci-edit-001'
  | 'davinci-search-document'
  | 'gpt-3.5-turbo-16k-0613'
  | 'curie-search-query'
  | 'babbage-similarity'
  | 'ada-search-document'
  | 'text-ada-001'
  | 'text-similarity-davinci-001'
  | 'gpt-3.5-turbo-16k'
  | 'curie'
  | 'curie-similarity'
  | 'gpt-3.5-turbo-0613'
  | 'babbage-code-search-code'
  | 'code-search-babbage-code-001'
  | 'text-search-babbage-doc-001'
  | 'text-curie-001'
  | 'gpt-3.5-turbo-0301';
