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
              console.error('VITE_ANTHROPIC_API_KEY not set');
              return null;
            }
            try {
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

              if (!response.ok) {
                const err = await response.text();
                console.error('Anthropic error:', err);
                return null;
              }

              const data = await response.json();
              const text = data.content?.[0]?.text;
              try {
                return JSON.parse(text);
              } catch {
                console.error('Invalid JSON from Anthropic:', text);
                return null;
              }
            } catch (err) {
              console.error('LLM call failed:', err);
              return null;
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