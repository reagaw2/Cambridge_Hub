/**
 * topicStore.js — Student data layer (Physics)
 * Cache-First: loads from localStorage instantly, syncs with Supabase in background.
 * Uses user_id (from auth.uid()) for RLS-compliant reads/writes.
 */

import { supabaseClient } from "@/api/base44Client";

// ── Helpers ────────────────────────────────────────────────────────────────

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
});

let _cache = null;
let _recordId = null;
let _userEmail = null;
let _userId = null;
let _loadPromise = null;

// ── localStorage cache helpers ─────────────────────────────────────────────

function localKey(userEmail) {
  return `hub_student_progress_${userEmail}`;
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
  } catch {}
}

function clearLocalCache(userEmail) {
  try {
    localStorage.removeItem(localKey(userEmail));
  } catch {}
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ── Supabase fetch ─────────────────────────────────────────────────────────

async function fetchFromSupabase(userId) {
  const { data: records, error } = await withTimeout(
    supabaseClient.from('StudentData').select('*').eq('user_id', userId),
    6000,
    { data: null, error: new Error('timeout') }
  );

  if (error || !records) {
    console.warn("[topicStore] fetchFromSupabase error:", error?.message);
    return null;
  }

  if (records.length > 0) {
    const record = records[0];
    return {
      _recordId: record.id,
      data: {
        topics: record.topics || {},
        written_review_bank: record.written_review_bank || [],
        review_bank_clears: record.review_bank_clears ?? 0,
        mcq_attempts: record.mcq_attempts || [],
        mcq_review_bank: record.mcq_review_bank || [],
        global_streak: record.global_streak ?? 0,
        global_streak_last_date: record.global_streak_last_date ?? null,
        rest_day_passes: record.rest_day_passes ?? 0,
        daily_question_count: record.daily_question_count ?? null,
        last_session_time: record.last_session_time ?? null,
      },
    };
  }

  // No row yet — create one
  const { data: inserted, error: insertError } = await withTimeout(
    supabaseClient.from('StudentData').insert([{
      user_id: userId,
      user_email: _userEmail,
      ...DEFAULT_DATA(),
    }]).select(),
    6000,
    { data: null, error: new Error('insert timeout') }
  );

  if (insertError || !inserted?.[0]) {
    console.warn("[topicStore] insert error:", insertError?.message);
    return { _recordId: null, data: DEFAULT_DATA() };
  }

  return { _recordId: inserted[0].id, data: DEFAULT_DATA() };
}

// ── preloadStore ───────────────────────────────────────────────────────────

export async function preloadStore(userEmail, userId) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _userId = userId;
    _loadPromise = null;
  }

  const cached = readLocalCache(userEmail);

  if (cached) {
    _cache = cached.data ?? cached;
    if (cached._recordId) _recordId = cached._recordId;
    console.log("[topicStore] cache-first: loaded from localStorage instantly");

    // Background sync
    if (userId) {
      fetchFromSupabase(userId).then(result => {
        if (!result) return;
        _recordId = result._recordId ?? _recordId;
        _cache = result.data;
        writeLocalCache(userEmail, { _recordId, data: result.data });
        console.log("[topicStore] background sync complete");
      }).catch(e => console.warn("[topicStore] background sync failed:", e));
    }

    return true;
  }

  // Slow path — first load
  console.log("[topicStore] no cache — fetching from Supabase (first load)");
  if (!userId) {
    _cache = DEFAULT_DATA();
    return false;
  }

  try {
    const result = await withTimeout(fetchFromSupabase(userId), 8000, null);
    if (result) {
      _recordId = result._recordId;
      _cache = result.data;
    } else {
      _cache = DEFAULT_DATA();
    }
    writeLocalCache(userEmail, { _recordId, data: _cache });
  } catch (e) {
    console.warn("[topicStore] first load failed:", e);
    _cache = DEFAULT_DATA();
  }
  _loadPromise = null;
  return false;
}

export function initStore(userEmail, userId) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _userId = userId;
    _loadPromise = null;
  }
}

// ── loadFromDB ─────────────────────────────────────────────────────────────

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

  if (!_userId) {
    _cache = DEFAULT_DATA();
    return _cache;
  }

  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const result = await withTimeout(fetchFromSupabase(_userId), 6000, null);
    if (result) {
      _recordId = result._recordId;
      _cache = result.data;
      writeLocalCache(_userEmail, { _recordId, data: _cache });
    } else {
      _cache = DEFAULT_DATA();
    }
    _loadPromise = null;
    return _cache;
  })();
  return _loadPromise;
}

// ── saveToDB ───────────────────────────────────────────────────────────────

async function saveToDB(data) {
  if (!_userEmail) return;
  _cache = data;
  writeLocalCache(_userEmail, { _recordId, data });

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
  };

  try {
    if (_recordId) {
      const { error } = await withTimeout(
        supabaseClient.from('StudentData').update(payload).eq('id', _recordId),
        5000,
        { error: new Error('save timeout') }
      );
      if (error) console.warn("[topicStore] update error:", error.message);
    } else {
      const { data: inserted, error } = await withTimeout(
        supabaseClient.from('StudentData').insert([{ user_id: _userId, user_email: _userEmail, ...payload }]).select(),
        5000,
        { data: null, error: new Error('insert timeout') }
      );
      if (error) {
        console.warn("[topicStore] insert error:", error.message);
      } else if (inserted?.[0]) {
        _recordId = inserted[0].id;
        writeLocalCache(_userEmail, { _recordId, data });
      }
    }
  } catch (e) {
    console.warn("[topicStore] save failed (non-fatal):", e);
  }
}

// ── Global Streak + Daily Count ────────────────────────────────────────────

export async function recordGlobalQuestionAnswered() {
  const data = await loadFromDB();
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  let dqc = data.daily_question_count;
  if (!dqc || dqc.date !== today) {
    dqc = { date: today, count: 0 };
  }
  dqc.count += 1;
  data.daily_question_count = dqc;

  if (dqc.count === 3) {
    if (data.global_streak_last_date === today) {
      // no-op
    } else if (data.global_streak_last_date === yesterday) {
      data.global_streak = (data.global_streak || 0) + 1;
    } else if (!data.global_streak_last_date) {
      data.global_streak = 1;
    } else {
      const parts = data.global_streak_last_date.split("/");
      const lastDateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const daysMissed = Math.floor((new Date() - lastDateObj) / 86400000) - 1;
      if (daysMissed >= 1 && (data.rest_day_passes || 0) > 0) {
        data.rest_day_passes = 0;
        data.global_streak = (data.global_streak || 0) + 1;
      } else {
        data.global_streak = 1;
      }
    }
    data.global_streak_last_date = today;

    if ((data.global_streak || 0) >= 5 && (data.rest_day_passes || 0) < 1) {
      data.rest_day_passes = 1;
    }
  }

  saveToDB(data).catch(() => {});
}

export async function recordAppOpen() {
  const data = await loadFromDB();
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  data.last_session_time = new Date().toISOString();

  if (data.global_streak_last_date && data.global_streak_last_date !== today && data.global_streak_last_date !== yesterday) {
    const parts = data.global_streak_last_date.split("/");
    const lastDateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const daysMissed = Math.floor((new Date() - lastDateObj) / 86400000);
    if (daysMissed > 1) {
      if ((data.rest_day_passes || 0) > 0) {
        data.rest_day_passes = 0;
      } else {
        data.global_streak = 0;
      }
    }
  }

  saveToDB(data).catch(() => {});

  return {
    global_streak: data.global_streak || 0,
    rest_day_passes: data.rest_day_passes || 0,
    daily_question_count: data.daily_question_count,
    last_session_time: data.last_session_time,
    written_review_bank_count: (data.written_review_bank || []).length,
    mcq_review_bank_count: (data.mcq_review_bank || []).length,
  };
}

export async function getStreakData() {
  const data = await loadFromDB();
  return {
    global_streak: data.global_streak || 0,
    rest_day_passes: data.rest_day_passes || 0,
    daily_question_count: data.daily_question_count,
    global_streak_last_date: data.global_streak_last_date,
  };
}

// ── Topic attempts ─────────────────────────────────────────────────────────

export async function recordAttempt(topicKey, score, { total_marks = 1, question_id = null } = {}) {
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
    // already recorded today
  } else if (topic.last_streak_date === yesterday) {
    topic.streak = (topic.streak || 0) + 1;
  } else {
    topic.streak = 1;
  }
  topic.last_streak_date = today;

  saveToDB(data).catch(() => {});
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function getTopicData(topicKey) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await loadFromDB();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };

  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const { last_attempted } = topic;
  const mcqAttempts = (data.mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);

  const hasWritten = attempts.length > 0;
  const hasMCQ = mcqAttempts.length > 0;

  if (!hasWritten && !hasMCQ) return null;

  let trend = "steady";
  if (hasWritten) {
    const last = attempts[attempts.length - 1];
    const score = last.score ?? 0;
    const total = last.total_marks ?? 1;
    const ratio = total > 0 ? score / total : 0;
    if (score === 0) trend = "needs_work";
    else if (ratio >= 1) trend = "improving";
    else trend = "steady";
  }

  if (hasMCQ) {
    const lastMCQ = mcqAttempts[mcqAttempts.length - 1];
    const lastWrittenDate = last_attempted;
    const mcqIsMoreRecent = !lastWrittenDate || lastMCQ.date >= lastWrittenDate;
    if (!hasWritten || mcqIsMoreRecent) {
      if (lastMCQ.correct && !lastMCQ.flagged_as_guess) trend = "improving";
      else if (lastMCQ.correct && lastMCQ.flagged_as_guess) trend = "steady";
      else trend = "needs_work";
    }
  }

  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  let latestDate = last_attempted || null;
  if (hasMCQ) {
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
  const lastStreakDate = topic.last_streak_date || null;
  if (lastStreakDate && lastStreakDate !== today && lastStreakDate !== yesterday) {
    currentStreak = 0;
  }

  if (!hasWritten && hasMCQ) {
    const days = [...new Set(mcqAttempts.map(a => a.date))].sort();
    let s = 0;
    let checkDate = today;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] === checkDate) {
        s++;
        const parts = checkDate.split("/");
        const prevDay = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        prevDay.setDate(prevDay.getDate() - 1);
        checkDate = toDateString(prevDay);
      } else {
        break;
      }
    }
    currentStreak = s;
  }

  return { trend, streak: currentStreak, lastLabel, attempts };
}

// ── Written Review Bank ────────────────────────────────────────────────────

export async function addToReviewBank({ question_id, topic, question_text, mark_scheme, total_marks, first_attempt_score, first_attempt_feedback }) {
  const data = await loadFromDB();
  if (data.written_review_bank.find(q => q.question_id === question_id)) return;

  const priority = first_attempt_score === 0 ? 1 : 2;
  const locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  data.written_review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority,
    locked_until,
  });
  saveToDB(data).catch(() => {});
}

export async function resetReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.written_review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    saveToDB(data).catch(() => {});
  }
}

export async function removeFromReviewBank(question_id) {
  const data = await loadFromDB();
  data.written_review_bank = data.written_review_bank.filter(q => q.question_id !== question_id);
  saveToDB(data).catch(() => {});
}

export async function getReviewBank() {
  const data = await loadFromDB();
  return [...data.written_review_bank].sort((a, b) => a.priority - b.priority);
}

export async function incrementReviewBankClears() {
  const data = await loadFromDB();
  data.review_bank_clears = (data.review_bank_clears || 0) + 1;
  saveToDB(data).catch(() => {});
}

// ── MCQ Review Bank ────────────────────────────────────────────────────────

export async function getGuessReviewBank() {
  const data = await loadFromDB();
  return (data.mcq_review_bank || []).map(e =>
    typeof e === "string" ? { question_id: e, locked_until: null } : e
  );
}

export async function resetGuessReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.mcq_review_bank.find(e =>
    (typeof e === "string" ? e : e.question_id) === question_id
  );
  if (entry && typeof entry === "object") {
    entry.locked_until = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    saveToDB(data).catch(() => {});
  } else if (typeof entry === "string") {
    const idx = data.mcq_review_bank.indexOf(entry);
    data.mcq_review_bank[idx] = {
      question_id,
      locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    };
    saveToDB(data).catch(() => {});
  }
}

// ── MCQ Attempts ────────────────────────────────────────────────────────────

export async function saveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const normKey = normaliseTopicKey(topic);
  const data = await loadFromDB();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.mcq_review_bank) data.mcq_review_bank = [];

  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  data.mcq_attempts.push({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning, date: today });

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

  if (flagged_as_guess || !correct) {
    const existing = data.mcq_review_bank.find(e => (typeof e === "string" ? e : e.question_id) === question_id);
    if (!existing) {
      data.mcq_review_bank.push({
        question_id,
        locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        flagged_as_guess: !!flagged_as_guess,
      });
    }
  } else if (correct && !flagged_as_guess) {
    data.mcq_review_bank = data.mcq_review_bank.filter(e => (typeof e === "string" ? e : e.question_id) !== question_id);
  }

  saveToDB(data).catch(() => {});
  recordGlobalQuestionAnswered().catch(() => {});
}

export async function getMCQOnlyTopicNames(writtenKeys) {
  const data = await loadFromDB();
  const seen = new Set();
  const topics = [];
  for (const a of (data.mcq_attempts || [])) {
    const normKey = normaliseTopicKey(a.topic);
    if (!seen.has(normKey) && !writtenKeys.includes(normKey)) {
      seen.add(normKey);
      topics.push({ label: a.topic, key: normKey });
    }
  }
  return topics;
}

export async function getMCQStats(topic) {
  const data = await loadFromDB();
  const attempts = (data.mcq_attempts || []).filter(a => a.topic === topic);
  if (!attempts.length) return null;
  const total_attempted = attempts.length;
  const reasoned_correct = attempts.filter(a => a.correct && !a.flagged_as_guess).length;
  const guessed = attempts.filter(a => a.flagged_as_guess).length;
  const reasoned_correct_percentage = Math.round((reasoned_correct / total_attempted) * 100);
  return { total_attempted, reasoned_correct, guessed, reasoned_correct_percentage };
}

export async function shouldShowReviewGate() {
  const data = await loadFromDB();
  const writtenCount = (data.written_review_bank || []).length;
  const mcqCount = (data.mcq_review_bank || []).length;
  if (writtenCount < 5 && mcqCount < 5) return false;
  const lastSession = data.last_session_time;
  if (!lastSession) return false;
  const hoursSince = (Date.now() - new Date(lastSession).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 18;
}

export async function resetData() {
  _cache = DEFAULT_DATA();
  if (_userEmail) {
    clearLocalCache(_userEmail);
    if (_recordId) {
      saveToDB(_cache).catch(() => {});
    }
  }
}