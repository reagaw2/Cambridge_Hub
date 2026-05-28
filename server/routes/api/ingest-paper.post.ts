import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

const SYLLABUS_TOPICS = {
  physics: [
    "Physical Quantities & Units", "Kinematics", "Forces & Equilibrium",
    "Momentum", "Work, Energy & Power", "Deformation of Solids", "Waves",
    "Circular Motion", "Gravitational Fields", "Thermal Physics", "Oscillations",
    "Electric Fields", "Capacitance", "Magnetic Fields", "Electromagnetic Induction",
    "Alternating Currents", "Quantum Physics", "Nuclear Physics",
    "Medical Imaging", "Astrophysics",
  ],
  cs: [
    "Data Representation", "Compression", "Computers and Components",
    "Operating Systems", "Language Translators", "Ethics and Ownership",
    "Networks and the Internet", "Data Security", "Data Integrity",
    "Databases", "Algorithm Design", "Data Types and Structures",
    "Programming Paradigms", "Artificial Intelligence",
  ],
};

function topicToKey(topic: string): string {
  return topic.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function extractPaperMeta(filename: string) {
  // e.g. 9702_s25_qp_42.pdf -> { code: "9702", session: "S25", variant: "42" }
  const match = filename.match(/(\d{4})_([a-z]\d{2})_(?:qp|ms)_(\d+)/i);
  if (!match) return null;
  const [, code, sessionRaw, variant] = match;
  const seasonMap: Record<string, string> = { s: "MJ", m: "FM", w: "ON" };
  const season = seasonMap[sessionRaw[0].toLowerCase()] ?? sessionRaw[0].toUpperCase();
  const year = "20" + sessionRaw.slice(1);
  return { code, session: `${season}${year}`, variant, raw: sessionRaw };
}

function buildQuestionId(code: string, session: string, variant: string, qNum: number): string {
  return `${code === "9702" ? "PHYS" : "CS"}-${code}-${session}-${variant}-Q${String(qNum).padStart(2, "0")}`;
}

function splitByQuestions(text: string): { num: number; text: string }[] {
  // Split on "Question N" or "N " at start of line followed by a mark annotation
  const parts: { num: number; text: string }[] = [];
  const regex = /(?:^|\n)\s*(?:Question\s+)?(\d{1,2})\s*\n/gm;
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    // Fallback: try splitting on bold numbered sections
    const simple = text.split(/\n(?=\d{1,2}\s+[\[(])/);
    return simple.map((t, i) => ({ num: i + 1, text: t.trim() })).filter(q => q.text.length > 30);
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const qText = text.slice(start, end).trim();
    if (qText.length > 30) {
      parts.push({ num: parseInt(matches[i][1], 10), text: qText });
    }
  }

  return parts;
}

function splitMarkSchemeByQuestion(msText: string, questionNums: number[]): Record<number, string> {
  const result: Record<number, string> = {};
  for (const qNum of questionNums) {
    // Find section starting with "Question N" or just "N " in MS
    const patterns = [
      new RegExp(`Question\\s+${qNum}\\b([\\s\\S]*?)(?=Question\\s+${qNum + 1}\\b|$)`, "i"),
      new RegExp(`\\b${qNum}\\s*\\n([\\s\\S]*?)(?=\\b${qNum + 1}\\s*\\n|$)`),
    ];
    for (const p of patterns) {
      const m = msText.match(p);
      if (m) { result[qNum] = m[1].trim(); break; }
    }
    if (!result[qNum]) result[qNum] = "";
  }
  return result;
}

async function classifyAndGenerateNodes(
  questionText: string,
  markSchemeText: string,
  subject: "physics" | "cs",
  apiKey: string
): Promise<{
  topics: string[];
  nodes: { node_index: number; mark_type: string; keyword: string; aliases: string[]; is_mandatory: boolean; dependent_on: number | null; max_marks: number }[];
  total_marks: number;
  difficulty: string;
}> {
  const topicList = SYLLABUS_TOPICS[subject].join(", ");
  const prompt = `You are an expert Cambridge ${subject === "physics" ? "A Level Physics (9702)" : "A Level Computer Science (9618)"} examiner and curriculum analyst.

QUESTION TEXT:
${questionText}

MARK SCHEME:
${markSchemeText || "(not available)"}

AVAILABLE TOPICS: ${topicList}

Analyse this question carefully and respond ONLY in this JSON format:
{
  "topics": ["list of 1-3 matching topics from the available list"],
  "total_marks": <integer>,
  "difficulty": "easy" | "medium" | "hard",
  "nodes": [
    {
      "node_index": 0,
      "mark_type": "B1" | "M1" | "A1" | "C1",
      "keyword": "the exact phrase or concept the student must include",
      "aliases": ["alternative acceptable phrasings"],
      "is_mandatory": true | false,
      "dependent_on": null | <node_index of prerequisite mark>,
      "max_marks": 1
    }
  ]
}

Rules for nodes:
- Create one node per mark point in the mark scheme
- Use M1 for mandatory marks that must come before A1 marks
- Set dependent_on to the node_index of the M1 mark if this is an A1 mark
- Extract the single most important keyword or phrase for each mark
- aliases should list 2-3 equally acceptable phrasings`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic error: ${response.status} ${err}`);
  }

  const data = await response.json() as { content: { text: string }[] };
  let text = data.content?.[0]?.text ?? "{}";

  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) text = jsonMatch[1].trim();

  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) text = objMatch[0];

  return JSON.parse(text);
}

export default defineHandler(async (event) => {
  const body = await readBody<{
    questionPaperText: string;
    markSchemeText: string;
    questionPaperFilename: string;
    markSchemeFilename: string;
    subject: "physics" | "cs";
    supabaseUrl: string;
    supabaseServiceKey: string;
  }>(event);

  const apiKey = process.env.NITRO_ANTHROPIC_API_KEY;
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: "ANTHROPIC_API_KEY not configured" });

  if (!body.questionPaperText || !body.questionPaperFilename) {
    throw createError({ statusCode: 400, statusMessage: "questionPaperText and questionPaperFilename are required" });
  }

  // Parse paper metadata from filename
  const meta = extractPaperMeta(body.questionPaperFilename);
  if (!meta) {
    throw createError({ statusCode: 400, statusMessage: `Could not parse paper metadata from filename: ${body.questionPaperFilename}. Expected format: 9702_s25_qp_42.pdf` });
  }

  const { code, session, variant } = meta;

  // Split papers into question chunks
  const questions = splitByQuestions(body.questionPaperText);
  if (questions.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Could not split question paper into individual questions. Check that the text was extracted correctly." });
  }

  const msChunks = splitMarkSchemeByQuestion(body.markSchemeText ?? "", questions.map(q => q.num));

  // Process questions in parallel (batches of 3 to avoid rate limits)
  const results: { questionId: string; qNum: number; topics: string[]; nodeCount: number; totalMarks: number }[] = [];
  const errors: { qNum: number; error: string }[] = [];
  const supabaseHeaders = {
    "Content-Type": "application/json",
    "apikey": body.supabaseServiceKey,
    "Authorization": `Bearer ${body.supabaseServiceKey}`,
    "Prefer": "resolution=merge-duplicates",
  };
  const supabaseUrl = body.supabaseUrl;

  const BATCH_SIZE = 3;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (q) => {
      try {
        const questionId = buildQuestionId(code, session, variant, q.num);
        const msText = msChunks[q.num] ?? "";

        // 1. AI classification + node generation
        const analysis = await classifyAndGenerateNodes(q.text, msText, body.subject, apiKey);

        // 2. Upsert into questions table
        const questionRow = {
          id: questionId,
          topic: analysis.topics[0] ?? "Unknown",
          topic_key: topicToKey(analysis.topics[0] ?? "unknown"),
          subject: body.subject,
          paper_ref: `${code}/${variant} · ${session}`,
          label: `Question ${q.num}`,
          question_text: q.text.slice(0, 2000),
          total_marks: analysis.total_marks,
          difficulty: analysis.difficulty,
          mark_scheme_text: msText.slice(0, 3000),
        };

        await fetch(`${supabaseUrl}/rest/v1/questions`, {
          method: "POST",
          headers: { ...supabaseHeaders },
          body: JSON.stringify(questionRow),
        });

        // 3. Ensure topics exist + link via question_topics
        for (const topicName of analysis.topics) {
          const topicKey = topicToKey(topicName);

          // Upsert topic
          await fetch(`${supabaseUrl}/rest/v1/topics`, {
            method: "POST",
            headers: { ...supabaseHeaders },
            body: JSON.stringify({ key: topicKey, name: topicName, subject: body.subject }),
          });

          // Upsert junction
          await fetch(`${supabaseUrl}/rest/v1/question_topics`, {
            method: "POST",
            headers: { ...supabaseHeaders },
            body: JSON.stringify({ question_id: questionId, topic_key: topicKey }),
          });
        }

        // 4. Delete old nodes + insert fresh ones
        await fetch(`${supabaseUrl}/rest/v1/mark_scheme_nodes?question_id=eq.${questionId}`, {
          method: "DELETE",
          headers: { ...supabaseHeaders },
        });

        if (analysis.nodes.length > 0) {
          await fetch(`${supabaseUrl}/rest/v1/mark_scheme_nodes`, {
            method: "POST",
            headers: { ...supabaseHeaders },
            body: JSON.stringify(analysis.nodes.map(n => ({ ...n, question_id: questionId }))),
          });
        }

        results.push({ questionId, qNum: q.num, topics: analysis.topics, nodeCount: analysis.nodes.length, totalMarks: analysis.total_marks });
      } catch (err: any) {
        errors.push({ qNum: q.num, error: err.message ?? String(err) });
      }
    }));

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < questions.length) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  return {
    ok: true,
    paperId: `${code}/${variant}/${session}`,
    questionsFound: questions.length,
    questionsProcessed: results.length,
    errors,
    results,
  };
});