import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Routes LLM calls through the Nitro server-side API endpoint (/api/llm).
// This keeps the Anthropic API key server-side and avoids all CORS issues.
async function callLocalLLM(prompt, schema) {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, schema }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`/api/llm ${response.status}: ${errText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('LLM Core execution failure:', err);
    return null;
  }
}

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
          InvokeLLM: async ({ prompt, response_json_schema }) => {
            return await callLocalLLM(prompt, response_json_schema);
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
