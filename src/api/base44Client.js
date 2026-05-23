import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const base44 = new Proxy(supabaseClient, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }

    if (prop === 'integrations') {
      return {
        Core: {
          InvokeLLM: async ({ prompt, response_json_schema }) => {
            const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

            if (!apiKey) {
              console.error('[LLM] VITE_ANTHROPIC_API_KEY is not set. Please add it to your .env.local file.');
              throw new Error('VITE_ANTHROPIC_API_KEY is not configured. Please add it to your environment variables.');
            }

            console.log('[LLM] Calling Anthropic via proxy...');

            const response = await fetch('/anthropic/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 4000,
                messages: [
                  {
                    role: 'user',
                    content: `${prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(response_json_schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
                  },
                ],
              }),
            });

            console.log('[LLM] Response status:', response.status);

            if (!response.ok) {
              const err = await response.text();
              console.error('[LLM] Anthropic API error:', response.status, err);
              throw new Error(`Anthropic API error ${response.status}: ${err}`);
            }

            const data = await response.json();
            const text = data.content?.[0]?.text;

            if (!text) {
              console.error('[LLM] No text in response:', data);
              throw new Error('No text content in Anthropic response');
            }

            try {
              return JSON.parse(text);
            } catch (parseErr) {
              console.error('[LLM] Failed to parse JSON response:', text);
              throw new Error(`Invalid JSON from Anthropic: ${text.slice(0, 200)}`);
            }
          },
        },
      };
    }

    if (prop === 'entities') {
      return new Proxy({}, {
        get(_, tableName) {
          return {
            list: async () => {
              const { data } = await supabaseClient.from(tableName).select('*');
              return data ?? [];
            },
            filter: async (matchCriteria) => {
              const { data } = await supabaseClient.from(tableName).select('*').match(matchCriteria);
              return data ?? [];
            },
            create: async (rowData) => {
              const { data } = await supabaseClient.from(tableName).insert([rowData]).select();
              return data ? data[0] : null;
            },
            update: async (id, rowData) => {
              const { data } = await supabaseClient.from(tableName).update(rowData).eq('id', id).select();
              return data ? data[0] : null;
            },
          };
        },
      });
    }

    return undefined;
  },
});