import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
  },
});


export const base44 = {
  from: (...args) => supabaseClient.from(...args),
  rpc: (...args) => supabaseClient.rpc(...args),
  storage: supabaseClient.storage,
  channel: (...args) => supabaseClient.channel(...args),
  removeChannel: (...args) => supabaseClient.removeChannel(...args),

  auth: supabaseClient.auth,

  integrations: {
    Core: {
      InvokeLLM: invokeLLM,
    },
  },

  agents: {
    createConversation: async ({ agent_name }) => {
      const { data, error } = await supabaseClient
        .from('agent_conversations')
        .insert([{ agent_name, messages: [] }])
        .select();
      if (error) throw error;
      return data[0];
    },
    addMessage: async (conversation, message) => {
      const updatedMessages = [...(conversation.messages || []), message];
      const { error } = await supabaseClient
        .from('agent_conversations')
        .update({ messages: updatedMessages })
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
  },

  entities: new Proxy({}, {
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
  }),
};