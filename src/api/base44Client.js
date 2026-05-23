import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function invokeLLM({ prompt, response_json_schema }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const requestBody = {
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(response_json_schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
      },
    ],
  };

  // Call via Vite proxy (dev) — proxy adds the auth headers server-side
  const response = await fetch('/api/llm', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Include key in header for environments where proxy doesn't inject it
      ...(apiKey ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } : {}),
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error('No text content in response');
  }

  // Strip markdown code blocks if present
  let jsonText = text.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  return JSON.parse(jsonText);
}

export const base44 = new Proxy(supabaseClient, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }

    if (prop === 'integrations') {
      return {
        Core: {
          InvokeLLM: invokeLLM,
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