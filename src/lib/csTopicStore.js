/**
 * csTopicStore.js — Computer Science student data layer
 * Source of truth: Supabase. localStorage = render cache only.
 */

import { supabaseClient } from "@/api/base44Client";
import { normaliseTopicKey, toDateString, recordGlobalQuestionAnswered } from "./topicStore";

export { normaliseTopicKey, toDateString };

const DEFAULT_CS_DATA = () => ({
  topics: {},
  cs_review_bank: [],
  cs_review_bank_clears: 0,
  cs_mcq_attempts: [],
  cs_guess_review_bank: [],
});

let _cache = null;
let _recordId = null;
let _userEmail = null;
let _userId = null;
let _ready = false;
let _readyPromise = null;

function localKey(e) { return `hub_cs_v3_${e}`; }

function readLocal(email) {
  try { return JSON.parse(localStorage.getItem(localKey(email))); } catch { return null; }
}

function writeLocal(email, payload) {
  try { localStorage.setItem(localKey(email), JSON.stringify(payload)); } catch {}
}

function clearLocal(email) {
  try {
    ['hub_cs_progress_', 'hub_cs_progress_v2_', 'hub_cs_v3_'].forEach(p => {
      localStorage.removeItem(p + email);
    });
  } catch {}
}

async function fetchFromSupabase(userId) {
  console.log('[csStore] fetching from Supabase for user:', userId);

  const { data: rows, error } = await supabaseClient
    .from('StudentData')
    .select('id, cs_data')
    .eq('user_id', userId);

  if (error) {
    console.error('[csStore] FETCH ERROR:', error.message, error.code);
    return null;
  }

  console.log('[csStore] fetched rows:', rows?.length ?? 0);

  if (rows && rows.length > 0) {
    const r = rows[0];
    const raw = r.cs_data;
    const data = (raw && typeof raw === "object" && Object.keys(raw).length > 0)
      ? {
          topics: raw.topics || {},
          cs_review_bank: raw.cs_review_bank || [],
          cs_review_bank_clears: raw.cs_review_bank_clears ?? 0,
          cs_mcq_attempts: raw.cs_mcq_attempts || [],
          cs_guess_review_bank: raw.cs_guess_review_bank || [],
        }
      : DEFAULT_CS_DATA();
    return { id: r.id, data };
  }

  return { id: null, data: DEFAULT_CS_DATA() };
}

async function pushToSupabase(data) {
  if (!_userId) return;
  try {
    if (_recordId) {
      const { error } = await supabaseClient
        .from('StudentData')
        .update({ cs_data: data })
        .eq('id', _recordId);
      if (error) console.error('[csStore] UPDATE ERROR:', error.message, error.code);
    } else {
      const { data: rows, error } = await supabaseClient
        .from('StudentData')
        .update({ cs_data: data })
        .eq('user_id', _userId)
        .select();
      if (error) {
        console.error('[csStore] UPDATE-BY-USER_ID ERROR:', error.message);
      } else if (rows?.[0]) {
        _recordId = rows[0].id;
        if (_userEmail) writeLocal(_userEmail, { id: _recordId, data });
      }
    }
  } catch (e) {
    console.error('[csStore] pushToSupabase exception:', e);
  }
}

export async function preloadCSStore(userEmail, userId) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _userId = userId;
    _ready = false;
    _readyPromise = null;
  }

  if (_ready) return;

  const local = readLocal(userEmail);
  if (local?.data && !_cache) {
    _cache = local.data;
    if (local.id) _recordId = local.id;
  }

  _readyPromise = (async () => {
    const result = await fetchFromSupabase(userId);
    if (result) {
      _recordId = result.id ?? _recordId;
      _cache = result.data;
      writeLocal(userEmail, { id: _recordId, data: _cache });
      console.log('[csStore] ✓ Supabase data loaded');
    } else {
      if (!_cache) _cache = DEFAULT_CS_DATA();
      console.warn('[csStore] ⚠ Supabase failed, using cache/default');
    }
    _ready = true;
    _readyPromise = null;
  })();

  await _readyPromise;
}

async function ensureLoaded() {
  if (_ready && _cache) return _cache;
  if (_readyPromise) { await _readyPromise; return _cache; }
  if (!_userId) { if (!_cache) _cache = DEFAULT_CS_DATA(); return _cache; }

  _readyPromise = (async () => {
    const result = await fetchFromSupabase(_userId);
    if (result) {
      _recordId = result.id ?? _recordId;
      _cache = result.data;
      if (_userEmail) writeLocal(_userEmail, { id: _recordId, data: _cache });
    } else {
      if (!_cache) _cache = DEFAULT_CS_DATA();
    }
    _ready = true;
    _readyPromise = null;
  })();

  await _readyPromise;
  return _cache;
}

function saveToDB(data) {
  _cache = data;
  if (_userEmail) writeLocal(_userEmail, { id: _recordId, data });
  pushToSupabase(data).catch(e => console.error('[csStore] bg save failed:', e));
}

export async function csRecordAttempt(topicKey, score, { total_marks = 1, question_id = null } = {}) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await ensureLoaded();
  if (!data.topics[normKey]) {
    data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  }
  const topic = data.topics[normKey];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  topic.attempts.push({ score, total_marks, date: today, question_id });
  topic.last_attempted = today;
  if (topic.last_streak_date === today) {
    // no-op
  } else if (topic.last_streak_date === yesterday) {
    topic.streak = (topic.streak || 0) + 1;
  } else {
    topic.streak = 1;
  }
  topic.last_streak_date = today;
  saveToDB(data);
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function csGetTopicData(topicKey) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await ensureLoaded();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const mcqAttempts = (data.cs_mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);

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
  if (mcqAttempts.length > 0) {
    const d = mcqAttempts[mcqAttempts.length - 1].date;
    if (!latestDate || d > latestDate) latestDate = d;
  }

  let lastLabel = null;
  if (latestDate) {
    if (latestDate === today) lastLabel = "Today";
    else if (latestDate === yesterday) lastLabel = "Yesterday";
    else {
      const parts = latestDate.split("/");
      if (parts.length === 3) {
        const dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diffDays = Math.floor((new Date() - dateObj) / 86400000);
        lastLabel = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
      } else {
        lastLabel = latestDate;
      }
    }
  }

  let currentStreak = topic.streak || 0;
  if (topic.last_streak_date && topic.last_streak_date !== today && topic.last_streak_date !== yesterday) {
    currentStreak = 0;
  }

  return { trend, streak: currentStreak, lastLabel, attempts };
}

export async function csAddToReviewBank({ question_id, topic, question_text, mark_scheme, total_marks, first_attempt_score, first_attempt_feedback }) {
  const data = await ensureLoaded();
  if (data.cs_review_bank.find(q => q.question_id === question_id)) return;
  data.cs_review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority: first_attempt_score === 0 ? 1 : 2,
    locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  saveToDB(data);
}

export async function csGetReviewBank() {
  const data = await ensureLoaded();
  return [...(data.cs_review_bank || [])].sort((a, b) => a.priority - b.priority);
}

export async function csRemoveFromReviewBank(question_id) {
  const data = await ensureLoaded();
  data.cs_review_bank = data.cs_review_bank.filter(q => q.question_id !== question_id);
  saveToDB(data);
}

export async function csResetReviewBankLock(question_id) {
  const data = await ensureLoaded();
  const entry = data.cs_review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    saveToDB(data);
  }
}

export async function csSaveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const normKey = normaliseTopicKey(topic);
  const data = await ensureLoaded();
  if (!data.cs_mcq_attempts) data.cs_mcq_attempts = [];
  if (!data.cs_guess_review_bank) data.cs_guess_review_bank = [];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  data.cs_mcq_attempts.push({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning, date: today });

  if (!data.topics[normKey]) {
    data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  }
  const topicEntry = data.topics[normKey];
  topicEntry.attempts.push({ score: correct ? 1 : 0, total_marks: 1, date: today, question_id });
  topicEntry.last_attempted = today;
  if (topicEntry.last_streak_date === today) {
    // no-op
  } else if (topicEntry.last_streak_date === yesterday) {
    topicEntry.streak = (topicEntry.streak || 0) + 1;
  } else {
    topicEntry.streak = 1;
  }
  topicEntry.last_streak_date = today;

  if (flagged_as_guess) {
    const existing = data.cs_guess_review_bank.find(e => (typeof e === "string" ? e : e.question_id) === question_id);
    if (!existing) {
      data.cs_guess_review_bank.push({ question_id, locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() });
    }
  } else if (correct && !flagged_as_guess) {
    data.cs_guess_review_bank = data.cs_guess_review_bank.filter(e => (typeof e === "string" ? e : e.question_id) !== question_id);
  }

  saveToDB(data);
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function csGetGuessReviewBank() {
  const data = await ensureLoaded();
  return (data.cs_guess_review_bank || []).map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
}