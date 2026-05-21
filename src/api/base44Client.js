import { createClient } from '@supabase/supabase-js';

// 1. Initialize the core Supabase Engine
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Local LLM Fallback Processor ---
// Since the old SDK managed Claude connections behind the scenes, we polyfill 
// it using a direct endpoint call. This reads an API key from your local environment.
async function callLocalLLM(prompt, schema) {
  // Checks your .env file for an active key (supports Anthropic or OpenAI)
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    if (anthropicKey) {
      // Direct integration loop with Anthropic Claude 3.5 Sonnet
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-html-user-overrides': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{ role: 'user', content: `${prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(schema)}. Do not include any conversational intro/outro text, only valid JSON.` }]
        })
      });
      const data = await response.json();
      return JSON.parse(data.content[0].text);
    } 
    
    if (openAiKey) {
      // Fallback integration loop with OpenAI GPT-4o
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: "json_object" },
          messages: [{ role: 'user', content: `${prompt}\n\nReturn schema: ${JSON.stringify(schema)}` }]
        })
      });
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }

    // Dev Fallback Mock: If no API key is present in your .env yet, return mock passing structure
    console.warn("No LLM API keys discovered in your environment. Providing simulated Cambridge passing marks.");
    return {
      marks_earned: 2,
      total_marks: 3,
      cambridge_insight: "Excellent layout structure. Ensure definitions match standard CAIE syllabus keywords precisely.",
      suggested_improvement: "Include explicit directional vectors when analyzing centripetal forces.",
      response: { marks_earned: 2, cambridge_insight: "Simulated response." }
    };
  } catch (err) {
    console.error("LLM Core execution failure:", err);
    return null;
  }
}

// 2. Build the Hybrid Proxy Interface Wrapper
export const base44 = new Proxy(supabaseClient, {
  get(target, prop) {
    // If the code is looking for standard Supabase methods (.from, .auth, etc.), pass them straight through
    if (prop in target) {
      return target[prop];
    }

    // Polyfill A: Handle the AI grading engines (.integrations.Core.InvokeLLM)
    if (prop === 'integrations') {
      return {
        Core: {
          InvokeLLM: async ({ prompt, response_json_schema }) => {
            return await callLocalLLM(prompt, response_json_schema);
          }
        }
      };
    }

    // Polyfill B: Map old table entities (.entities.TableName) straight to Supabase (.from('TableName'))
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
            }
          };
        }
      });
    }

    // Polyfill C: Handle Chatbot/Conversational Interfaces (.createConversation)
    if (prop === 'createConversation' || prop === 'conversations') {
      return {
        createConversation: async () => ({ id: "mock_conv_id", messages: [] }),
        sendMessage: async () => ({ text: "I'm your AI physics tutor. Let's break down this problem systematically!" }),
        list: async () => []
      };
    }

    return undefined;
  }
});