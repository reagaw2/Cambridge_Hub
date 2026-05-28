/**
 * topicStore.js — Student data layer (Physics)
 * Source of truth: Supabase ONLY. localStorage is written AFTER Supabase loads.
 */

import { supabaseClient } from "@/api/base44Client";
import { buildMistakeDna, mergeMistakeDna } from "./mistakeDna";

export function toDateString(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function normaliseTopicKey(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const DEFAULT_DATA = () => ({
  topics: {},
  written_review_bank: [],
  review_bank_clears: 0,
  mcq_attempts: [],
  mcq_review_bank: [],
  global_streak: 0,
  global_streak_last_date: null,
  rest_day_passes: 0,
  daily_question_count: null,
  last_session_time: null,
  mistake_dna: [],
});

let _cache = null;
let _recordId = null;
let _userEmail = null;
let _userId = null;
let _supabaseLoaded = false;
let _loadPromise = null;

function localKey(e) { return `hub_physics_v4_${e}`; }
function readLocal(email) { try { return JSON.parse(localStorage.getItem(localKey(email))); } catch { return null; } }
function writeLocal(email, payload) { try { localStorage.setItem(localKey(email), JSON.stringify(payload)); } catch {} }

function clearAllLocalKeys(email) {
  try {
    ['hub_student_progress_', 'hub_student_progress_v2_', 'hub_physics_v3_', 'hub_physics_v4_'].forEach(p => {
      localStorage.removeItem(p + email);
    });
  } catch {}
}

async function loadFromSupabase(userId) {
  console.log('[topicStore] → fetching from Supabase...');
  const { data: rows, error } = await supabaseClient.from('StudentData').select('*').eq('user_id', userId);
  if (error) { console.error('[topicStore] ✗ fetch failed:', error.message); return null; }
  if (rows && rows.length > 0) {
    const r = rows[0];
    return {
      id: r.id,
      data: {
        topics: r.topics || {},
        written_review_bank: r.written_review_bank || [],
        review_bank_clears: r.review_bank_clears ?? 0,
        mcq_attempts: r.mcq_attempts || [],
        mcq_review_bank: r.mcq_review_bank || [],
        global_streak: r.global_streak ?? 0,
        global_streak_last_date: r.global_streak_last_date ?? null,
        rest_day_passes: r.rest_day_passes ?? 0,
        daily_question_count: r.daily_question_count ?? null,
        last_session_time: r.last_session_time ?? null,
        mistake_dna: Array.isArray(r.mistake_dna) ? r.mistake_dna : [],
      },
    };
  }
  console.log('[topicStore] no row found, creating new...');
  const { data: inserted, error: ie } = await supabaseClient
    .from('StudentData')
    .insert([{ user_id: userId, user_email: _userEmail, ...DEFAULT_DATA() }])
    .select();
  if (ie || !inserted?.[0]) { console.error('[topicStore] ✗ insert failed:', ie?.message); return { id: null, data: DEFAULT_DATA() }; }
  return { id: inserted[0].id, data: DEFAULT_DATA() };
}

export async function preloadStore(userEmail, userId) {
  if (_userEmail !== userEmail) { _cache = null; _recordId = null; _userEmail = userEmail; _userId = userId; _supabaseLoaded = false; _loadPromise = null; }
  if (_supabaseLoaded) return;
  if (_loadPromise) { await _loadPromise; return; }
  _loadPromise = loadFromSupabase(userId);
  const result = await _loadPromise;
  _loadPromise = null;
  if (result) { _recordId = result.id ?? _recordId; _cache = result.data; _supabaseLoaded = true; writeLocal(userEmail, { id: _recordId, data: _cache }); }
  else { const local = readLocal(userEmail); _cache = local?.data ?? DEFAULT_DATA(); if (local?.id) _recordId = local.id; _supabaseLoaded = false; }
}

async function ensureLoaded() {
  if (_supabaseLoaded && _cache) return _cache;
  if (_loadPromise) { await _loadPromise; return _cache ?? DEFAULT_DATA(); }
  if (_userId) {
    _loadPromise = loadFromSupabase(_userId);
    const result = await _loadPromise;
    _loadPromise = null;
    if (result) { _recordId = result.id ?? _recordId; _cache = result.data; _supabaseLoaded = true; if (_userEmail) writeLocal(_userEmail, { id: _recordId, data: _cache }); }
    else { if (!_cache) _cache = DEFAULT_DATA(); }
    return _cache;
  }
  if (!_cache) _cache = DEFAULT_DATA();
  return _cache;
}

function saveToDB(data) {
  _cache = data;
  if (_userEmail) writeLocal(_userEmail, { id: _recordId, data });
  pushToSupabase(data).catch(e => console.error('[topicStore] save failed:', e));
}

async function pushToSupabase(data) {
  if (!_userId) return;
  const payload = {
    topics: data.topics,
    written_review_bank: data.written_review_bank,
    review_bank_clears: data.review_bank_clears,
    mcq_attempts: data.mcq_attempts,
    mcq_review_bank: data.mcq_review_bank,
    global_streak: data.global_streak,
    global_streak_last_date: data.global_streak_last_date,
    rest_day_passes: data.rest_day_passes,
    daily_question_count: data.daily_question_count,
    last_session_time: data.last_session_time,
    mistake_dna: data.mistake_dna ?? [],
  };
  if (_recordId) {
    const { error } = await supabaseClient.from('StudentData').update(payload).eq('id', _recordId);
    if (error) console.error('[topicStore] update error:', error.message);
  } else {
    const { data: ins, error } = await supabaseClient.from('StudentData').insert([{ user_id: _userId, user_email: _userEmail, ...payload }]).select();
    if (error) console.error('[topicStore] insert error:', error.message);
    else if (ins?.[0]) { _recordId = ins[0].id; if (_userEmail) writeLocal(_userEmail, { id: _recordId, data }); }
  }
}

export async function recordGlobalQuestionAnswered() {
  const data = await ensureLoaded();
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  let dqc = data.daily_question_count;
  if (!dqc || dqc.date !== today) dqc = { date: today, count: 0 };
  dqc.count += 1;
  data.daily_question_count = dqc;
  if (dqc.count === 3) {
    if (data.global_streak_last_date === today) {}
    else if (data.global_streak_last_date === yesterday) { data.global_streak = (data.global_streak || 0) + 1; }
    else if (!data.global_streak_last_date) { data.global_streak = 1; }
    else {
      const parts = data.global_streak_last_date.split("/");
      const lastDateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const daysMissed = Math.floor((new Date() - lastDateObj) / 86400000) - 1;
      if (daysMissed >= 1 && (data.rest_day_passes || 0) > 0) { data.rest_day_passes = 0; data.global_streak = (data.global_streak || 0) + 1; }
      else { data.global_streak = 1; }
    }
    data.global_streak_last_date = today;
    if ((data.global_streak || 0) >= 5 && (data.rest_day_passes || 0) < 1) data.rest_day_passes = 1;
  }
  saveToDB(data);
}

export async function recordAppOpen() {
  const data = await ensureLoaded();
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  data.last_session_time = new Date().toISOString();
  if (data.global_streak_last_date && data.global_streak_last_date !== today && data.global_streak_last_date !== yesterday) {
    const parts = data.global_streak_last_date.split("/");
    const lastDateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const daysMissed = Math.floor((new Date() - lastDateObj) / 86400000);
    if (daysMissed > 1) { if ((data.rest_day_passes || 0) > 0) data.rest_day_passes = 0; else data.global_streak = 0; }
  }
  saveToDB(data);
  return { global_streak: data.global_streak || 0, rest_day_passes: data.rest_day_passes || 0, daily_question_count: data.daily_question_count, last_session_time: data.last_session_time, written_review_bank_count: (data.written_review_bank || []).length, mcq_review_bank_count: (data.mcq_review_bank || []).length };
}

export async function getStreakData() {
  const data = await ensureLoaded();
  return { global_streak: data.global_streak || 0, rest_day_passes: data.rest_day_passes || 0, daily_question_count: data.daily_question_count, global_streak_last_date: data.global_streak_last_date };
}

export async function recordAttempt(topicKey, score, { total_marks = 1, question_id = null } = {}) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await ensureLoaded();
  if (!data.topics[normKey]) data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const topic = data.topics[normKey];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  topic.attempts.push({ score, total_marks, date: today, question_id });
  topic.last_attempted = today;
  if (topic.last_streak_date === today) {}
  else if (topic.last_streak_date === yesterday) { topic.streak = (topic.streak || 0) + 1; }
  else { topic.streak = 1; }
  topic.last_streak_date = today;
  saveToDB(data);
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function getTopicData(topicKey) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await ensureLoaded();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const mcqAttempts = (data.mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);
  if (!attempts.length && !mcqAttempts.length) return null;
  let trend = "steady";
  if (attempts.length > 0) {
    const last = attempts[attempts.length - 1];
    const ratio = (last.total_marks ?? 1) > 0 ? (last.score ?? 0) / (last.total_marks ?? 1) : 0;
    if ((last.score ?? 0) === 0) trend = "needs_work";
    else if (ratio >= 1) trend = "improving";
    else trend = "steady";
  }
  if (mcqAttempts.length > 0) {
    const lastMCQ = mcqAttempts[mcqAttempts.length - 1];
    const mcqMoreRecent = !topic.last_attempted || lastMCQ.date >= topic.last_attempted;
    if (!attempts.length || mcqMoreRecent) {
      if (lastMCQ.correct && !lastMCQ.flagged_as_guess) trend = "improving";
      else if (lastMCQ.correct && lastMCQ.flagged_as_guess) trend = "steady";
      else trend = "needs_work";
    }
  }
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  let latestDate = topic.last_attempted || null;
  if (mcqAttempts.length > 0) { const d = mcqAttempts[mcqAttempts.length - 1].date; if (!latestDate || d > latestDate) latestDate = d; }
  let lastLabel = null;
  if (latestDate) {
    if (latestDate === today) lastLabel = "Today";
    else if (latestDate === yesterday) lastLabel = "Yesterday";
    else {
      const parts = latestDate.split("/");
      if (parts.length === 3) { const dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); const diffDays = Math.floor((new Date() - dateObj) / 86400000); lastLabel = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`; }
      else lastLabel = latestDate;
    }
  }
  let currentStreak = topic.streak || 0;
  if (topic.last_streak_date && topic.last_streak_date !== today && topic.last_streak_date !== yesterday) currentStreak = 0;
  return { trend, streak: currentStreak, lastLabel, attempts };
}

/**
 * writeMistakeDna
 * Now accepts `studentResponse` — the raw text the student typed.
 */
export async function writeMistakeDna(feedback, questionId, topic, marksEarned, totalMarks, studentResponse = "") {
  if (!feedback || marksEarned >= totalMarks) return;
  const data = await ensureLoaded();
  const incoming = buildMistakeDna(feedback, questionId, topic, "physics", marksEarned, totalMarks, studentResponse);
  if (!incoming.length) return;
  data.mistake_dna = mergeMistakeDna(data.mistake_dna ?? [], incoming);
  saveToDB(data);
}

export async function getMistakeDna() {
  const data = await ensureLoaded();
  return data.mistake_dna ?? [];
}

// ── Written Review Bank ────────────────────────────────────────────────────

export async function addToReviewBank({
  question_id,
  topic,
  question_text,
  mark_scheme,
  total_marks,
  first_attempt_score,
  first_attempt_feedback,
  first_attempt_answer = "",
}) {
  const data = await ensureLoaded();
  if (data.written_review_bank.find(q => q.question_id === question_id)) return;
  data.written_review_bank.push({
    question_id,
    topic,
    question_text,
    mark_scheme,
    total_marks,
    first_attempt_score,
    first_attempt_feedback,
    first_attempt_answer: (first_attempt_answer ?? "").slice(0, 600),
    date_added: toDateString(new Date()),
    priority: first_attempt_score === 0 ? 1 : 2,
    locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  saveToDB(data);
}

export async function resetReviewBankLock(question_id) {
  const data = await ensureLoaded();
  const entry = data.written_review_bank.find(q => q.question_id === question_id);
  if (entry) { entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); saveToDB(data); }
}

export async function removeFromReviewBank(question_id) {
  const data = await ensureLoaded();
  data.written_review_bank = data.written_review_bank.filter(q => q.question_id !== question_id);
  saveToDB(data);
}

export async function getReviewBank() {
  const data = await ensureLoaded();
  return [...data.written_review_bank].sort((a, b) => a.priority - b.priority);
}

export async function incrementReviewBankClears() {
  const data = await ensureLoaded();
  data.review_bank_clears = (data.review_bank_clears || 0) + 1;
  saveToDB(data);
}

export async function getGuessReviewBank() {
  const data = await ensureLoaded();
  return (data.mcq_review_bank || []).map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
}

export async function resetGuessReviewBankLock(question_id) {
  const data = await ensureLoaded();
  const idx = data.mcq_review_bank.findIndex(e => (typeof e === "string" ? e : e.question_id) === question_id);
  if (idx >= 0) {
    const entry = data.mcq_review_bank[idx];
    data.mcq_review_bank[idx] = { question_id, locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), ...(typeof entry === "object" ? entry : {}) };
    saveToDB(data);
  }
}

export async function saveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const normKey = normaliseTopicKey(topic);
  const data = await ensureLoaded();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.mcq_review_bank) data.mcq_review_bank = [];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  data.mcq_attempts.push({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning, date: today });
  if (!data.topics[normKey]) data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const topicEntry = data.topics[normKey];
  topicEntry.attempts.push({ score: correct ? 1 : 0, total_marks: 1, date: today, question_id });
  topicEntry.last_attempted = today;
  if (topicEntry.last_streak_date === today) {}
  else if (topicEntry.last_streak_date === yesterday) { topicEntry.streak = (topicEntry.streak || 0) + 1; }
  else { topicEntry.streak = 1; }
  topicEntry.last_streak_date = today;
  if (flagged_as_guess || !correct) {
    const existing = data.mcq_review_bank.find(e => (typeof e === "string" ? e : e.question_id) === question_id);
    if (!existing) data.mcq_review_bank.push({ question_id, locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), flagged_as_guess: !!flagged_as_guess });
  } else if (correct && !flagged_as_guess) {
    data.mcq_review_bank = data.mcq_review_bank.filter(e => (typeof e === "string" ? e : e.question_id) !== question_id);
  }
  saveToDB(data);
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function getMCQOnlyTopicNames(writtenKeys) {
  const data = await ensureLoaded();
  const seen = new Set();
  const topics = [];
  for (const a of (data.mcq_attempts || [])) {
    const normKey = normaliseTopicKey(a.topic);
    if (!seen.has(normKey) && !writtenKeys.includes(normKey)) { seen.add(normKey); topics.push({ label: a.topic, key: normKey }); }
  }
  return topics;
}

export async function getMCQStats(topic) {
  const data = await ensureLoaded();
  const attempts = (data.mcq_attempts || []).filter(a => a.topic === topic);
  if (!attempts.length) return null;
  const total_attempted = attempts.length;
  const reasoned_correct = attempts.filter(a => a.correct && !a.flagged_as_guess).length;
  const guessed = attempts.filter(a => a.flagged_as_guess).length;
  return { total_attempted, reasoned_correct, guessed, reasoned_correct_percentage: Math.round((reasoned_correct / total_attempted) * 100) };
}

export async function shouldShowReviewGate() {
  const data = await ensureLoaded();
  const writtenCount = (data.written_review_bank || []).length;
  const mcqCount = (data.mcq_review_bank || []).length;
  if (writtenCount < 5 && mcqCount < 5) return false;
  const lastSession = data.last_session_time;
  if (!lastSession) return false;
  const hoursSince = (Date.now() - new Date(lastSession).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 18;
}

export async function resetData() {
  const fresh = DEFAULT_DATA();
  _cache = fresh;
  _supabaseLoaded = true;
  if (_userEmail) { clearAllLocalKeys(_userEmail); pushToSupabase(fresh).catch(() => {}); }
}

export function initStore(userEmail, userId) {
  if (_userEmail !== userEmail) { _cache = null; _recordId = null; _userEmail = userEmail; _userId = userId; _supabaseLoaded = false; _loadPromise = null; }
}