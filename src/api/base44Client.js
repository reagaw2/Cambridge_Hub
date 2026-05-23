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
          InvokeLLM: async ({ prompt, response_json_schema, model }) => {
            const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

            if (!apiKey) {
              console.error('[LLM] VITE_ANTHROPIC_API_KEY is not set.');
              throw new Error('VITE_ANTHROPIC_API_KEY is not configured.');
            }

            // Try direct Anthropic call first, fall back to proxy
            const endpoints = [
              'https://api.anthropic.com/v1/messages',
              '/anthropic/v1/messages',
            ];

            let lastError = null;

            for (const endpoint of endpoints) {
              try {
                const response = await fetch(endpoint, {
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
                  lastError = new Error(`Anthropic API error ${response.status}: ${err}`);
                  continue;
                }

                const data = await response.json();
                const text = data.content?.[0]?.text;

                if (!text) {
                  lastError = new Error('No text content in Anthropic response');
                  continue;
                }

                // Extract JSON from the response text (handle markdown code blocks)
                let jsonText = text.trim();
                const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) {
                  jsonText = jsonMatch[1].trim();
                }

                return JSON.parse(jsonText);
              } catch (err) {
                lastError = err;
                continue;
              }
            }

            throw lastError || new Error('All endpoints failed');
          },
        },
      };
    }

    if (prop === 'agents') {
      return {
        createConversation: async ({ agent_name }) => {
          const { data, error } = await supabaseClient
            .from('agent_conversations')
            .insert([{ agent_name, messages: [] }])
            .select();
          if (error) throw error;
          return data[0];
        },
        addMessage: async (conversation, message) => {
          const messages = [...(conversation.messages || []), message];
          const { error } = await supabaseClient
            .from('agent_conversations')
            .update({ messages })
            .eq('id', conversation.id);
          if (error) throw error;
        },
        subscribeToConversation: (conversationId, callback) => {
          const channel = supabaseClient
            .channel(`conversation-${conversationId}`)
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'agent_conversations',
              filter: `id=eq.${conversationId}`,
            }, (payload) => {
              callback(payload.new);
            })
            .subscribe();
          return () => supabaseClient.removeChannel(channel);
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