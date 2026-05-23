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
            const response = await fetch('/api/llm', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ prompt, response_json_schema }),
            });

            if (!response.ok) {
              const err = await response.text();
              throw new Error(`LLM API error ${response.status}: ${err}`);
            }

            return response.json();
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