import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Hybrid proxy: passes Supabase native calls through unchanged,
// and polyfills the old Base44 SDK surface (.integrations, .entities).
export const base44 = new Proxy(supabaseClient, {
  get(target, prop) {
    // Pass all native Supabase methods (.from, .auth, .storage, etc.) straight through
    if (prop in target) {
      return target[prop];
    }

    // Polyfill: .integrations.Core.InvokeLLM(...)
    if (prop === 'integrations') {
      return {
        Core: {
          InvokeLLM: async ({ prompt, response_json_schema, model }) => {
            const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
            if (!apiKey) {
              console.error('VITE_ANTHROPIC_API_KEY not set');
              return null;
            }
            try {
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                  'content-type': 'application/json',
                  'anthropic-dangerous-direct-browser-access': 'true',
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

    // Polyfill: .entities.TableName.filter/create/update/list
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