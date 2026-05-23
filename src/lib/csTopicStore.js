/**
 * csTopicStore.js — Computer Science student data layer
 * Cache-First: loads from localStorage instantly, syncs with Supabase in background.
 */

import { base44 } from "@/api/base44Client";
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
let _loadPromise = null;

// ── localStorage helpers ───────────────────────────────────────────────────

function localKey(userEmail) {
  return `hub_cs_progress_${userEmail}`;
}

function readLocalCache(userEmail) {
  try {
    const raw = localStorage.getItem(localKey(userEmail));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalCache(userEmail, data) {
  try {
    localStorage.setItem(localKey(userEmail), JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearLocalCache(userEmail) {
  try {
    localStorage.removeItem(localKey(userEmail));
  } catch {
    // ignore
  }
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ── Supabase fetch ─────────────────────────────────────────────────────────

async function fetchFromSupabase(userEmail) {
  const { data: records, error } = await withTimeout(
    base44.from('StudentData').select('*').eq('user_email', userEmail),
    6000,
    { data: null, error: new Error('timeout') }
  );

  if (error || !records) return null;

  if (records.length > 0) {
    const record = records.sort((a, b) => {
      const ta = a.updated_date ? new Date(a.updated_date).getTime() : 0;
      const tb = b.updated_date ? new Date(b.updated_date).getTime() : 0;
      return tb - ta;
    })[0];

    const raw = record.cs_data;
    const data = (raw && typeof raw === "object" && Object.keys(raw).length > 0)
      ? {
          topics: raw.topics || {},
          cs_review_bank: raw.cs_review_bank || [],
          cs_review_bank_clears: raw.cs_review_bank_clears ?? 0,
          cs_mcq_attempts: raw.cs_mcq_attempts || [],
          cs_guess_review_bank: raw.cs_guess_review_bank || [],
        }
      : DEFAULT_CS_DATA();

    return { _recordId: record.id, data };
  }

  return { _recordId: null, data: DEFAULT_CS_DATA() };
}

// ── preloadCSStore — Cache-First entry point ───────────────────────────────

export async function preloadCSStore(userEmail) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _loadPromise = null;
  }

  const cached = readLocalCache(userEmail);

  if (cached) {
    // FAST PATH
    _cache = cached.data ?? cached;
    if (cached._recordId) _recordId = cached._recordId;
    console.log("[csStore] cache-first: loaded from localStorage instantly");

    // Background sync
    fetchFromSupabase(userEmail).then(result => {
      if (!result) return;
      _recordId = result._recordId ?? _recordId;
      _cache = result.data;
      writeLocalCache(userEmail, { _recordId, data: result.data });
      console.log("[csStore] background sync complete");
    }).catch(e => console.warn("[csStore] background sync failed:", e));

    return true;
  }

  // SLOW PATH
  console.log("[csStore] no cache — fetching from Supabase (first load)");
  try {
    const result = await withTimeout(fetchFromSupabase(userEmail), 8000, null);
    if (result) {
      _recordId = result._recordId;
      _cache = result.data;
    } else {
      _cache = DEFAULT_CS_DATA();
    }
    writeLocalCache(userEmail, { _recordId, data: _cache });
  } catch (e) {
    console.warn("[csStore] first load failed:", e);
    _cache = DEFAULT_CS_DATA();
  }
  _loadPromise = null;
  return false;
}

// ── loadFromDB — returns in-memory cache ──────────────────────────────────

async function loadFromDB() {
  if (_cache) return _cache;

  if (_userEmail) {
    const cached = readLocalCache(_userEmail);
    if (cached) {
      _cache = cached.data ?? cached;
      if (cached._recordId) _recordId = cached._recordId;
      return _cache;
    }
  }

  if (!_userEmail) { _cache = DEFAULT_CS_DATA(); return _cache; }

  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const result = await withTimeout(fetchFromSupabase(_userEmail), 6000, null);
    if (result) {
      _recordId = result._recordId;
      _cache = result.data;
      writeLocalCache(_userEmail, { _recordId, data: _cache });
    } else {
      _cache = DEFAULT_CS_DATA();
    }
    _loadPromise = null;
    return _cache;
  })();
  return _loadPromise;
}

// ── saveToDB — writes to Supabase AND updates localStorage ────────────────

async function saveToDB(data) {
  if (!_userEmail) return;
  _cache = data;

  // Update localStorage immediately
  writeLocalCache(_userEmail, { _recordId, data });

  try {
    if (_recordId) {
      const { error } = await withTimeout(
        base44.from('StudentData').update({ cs_data: data }).eq('id', _recordId),
        5000,
        { error: new Error('save timeout') }
      );
      if (error) console.warn("[csStore] update error (non-fatal):", error.message);
    } else {
      const { data: upserted, error } = await withTimeout(
        base44.from('StudentData').upsert({ user_email: _userEmail, cs_data: data }, { onConflict: 'user_email' }).select(),
        5000,
        { data: null, error: new Error('save timeout') }
      );
      if (error) {
        console.warn("[csStore] upsert error (non-fatal):", error.message);
      } else if (upserted && upserted[0]) {
        _recordId = upserted[0].id;
        writeLocalCache(_userEmail, { _recordId, data });
      }
    }
  } catch (e) {
    console.warn("[csStore] failed to save to DB (non-fatal):", e);
  }
}

export async function csRecordAttempt(topicKey, score, { total_marks = 1, question_id = null } = {}) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await loadFromDB();
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
  saveToDB(data).catch(() => {});
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function csGetTopicData(topicKey) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await loadFromDB();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const mcqAttempts = (data.cs_mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);

  if (attempts.length === 0 && mcqAttempts.length === 0) return null;

  let trend = "steady";
  if (attempts.length > 0) {
    const last = attempts[attempts.length - 1];
    const ratio = last.total_marks > 0 ? last.score / last.total_marks : 0;
    if (last.score === 0) trend = "needs_work";
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
    const lastMCQDate = mcqAttempts[mcqAttempts.length - 1].date;
    if (!latestDate || lastMCQDate > latestDate) latestDate = lastMCQDate;
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
  const data = await loadFromDB();
  if (data.cs_review_bank.find(q => q.question_id === question_id)) {
    saveToDB(data).catch(() => {});
    return;
  }
  const locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  data.cs_review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority: first_attempt_score === 0 ? 1 : 2,
    locked_until,
  });
  saveToDB(data).catch(() => {});
}

export async function csGetReviewBank() {
  const data = await loadFromDB();
  return [...(data.cs_review_bank || [])].sort((a, b) => a.priority - b.priority);
}

export async function csRemoveFromReviewBank(question_id) {
  const data = await loadFromDB();
  data.cs_review_bank = data.cs_review_bank.filter(q => q.question_id !== question_id);
  saveToDB(data).catch(() => {});
}

export async function csResetReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.cs_review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    saveToDB(data).catch(() => {});
  }
}

export async function csSaveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const normKey = normaliseTopicKey(topic);
  const data = await loadFromDB();
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

  saveToDB(data).catch(() => {});
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function csGetGuessReviewBank() {
  const data = await loadFromDB();
  return (data.cs_guess_review_bank || []).map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
}