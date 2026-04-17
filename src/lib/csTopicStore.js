/**
 * csTopicStore.js — Computer Science student data layer
 * Completely separate from Physics topicStore.
 * All CS data is stored under the `cs_data` field on the StudentData record.
 */

import { base44 } from "@/api/base44Client";
import { normaliseTopicKey, toDateString } from "./topicStore";

export { normaliseTopicKey, toDateString };

const CS_TOPIC_KEYS = [
  "data_representation",
  "compression",
  "computers_and_components",
  "operating_systems",
  "language_translators",
];

const DEFAULT_CS_DATA = () => ({
  topics: Object.fromEntries(CS_TOPIC_KEYS.map(k => [k, { attempts: [], last_attempted: null, streak: 0, last_streak_date: null }])),
  review_bank: [],
  review_bank_clears: 0,
  mcq_attempts: [],
  guess_review_bank: [],
});

let _cache = null;
let _recordId = null;
let _userEmail = null;
let _loadPromise = null;

export async function preloadCSStore(userEmail) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _loadPromise = null;
  }
  _cache = null;
  _loadPromise = null;
  return loadFromDB();
}

async function loadFromDB() {
  if (_cache) return _cache;
  if (_loadPromise) return _loadPromise;
  if (!_userEmail) { _cache = DEFAULT_CS_DATA(); return _cache; }

  _loadPromise = (async () => {
    try {
      const records = await base44.entities.StudentData.filter({ user_email: _userEmail });
      if (records && records.length > 0) {
        const record = records[0];
        _recordId = record.id;
        const csData = record.cs_data;
        _cache = csData ? {
          topics: csData.topics || DEFAULT_CS_DATA().topics,
          review_bank: csData.review_bank || [],
          review_bank_clears: csData.review_bank_clears ?? 0,
          mcq_attempts: csData.mcq_attempts || [],
          guess_review_bank: csData.guess_review_bank || [],
        } : DEFAULT_CS_DATA();
      } else {
        _cache = DEFAULT_CS_DATA();
      }
    } catch (e) {
      console.warn("csTopicStore: failed to load from DB", e);
      _cache = DEFAULT_CS_DATA();
    }
    _loadPromise = null;
    return _cache;
  })();

  return _loadPromise;
}

async function saveToDB(data) {
  if (!_userEmail) return;
  _cache = data;
  try {
    if (_recordId) {
      await base44.entities.StudentData.update(_recordId, { cs_data: data });
    } else {
      const records = await base44.entities.StudentData.filter({ user_email: _userEmail });
      if (records && records.length > 0) {
        _recordId = records[0].id;
        await base44.entities.StudentData.update(_recordId, { cs_data: data });
      } else {
        const created = await base44.entities.StudentData.create({ user_email: _userEmail, cs_data: data });
        _recordId = created.id;
      }
    }
  } catch (e) {
    console.warn("csTopicStore: failed to save to DB", e);
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
  await saveToDB(data);
}

export async function csGetTopicData(topicKey) {
  const normKey = normaliseTopicKey(topicKey);
  const data = await loadFromDB();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const mcqAttempts = (data.mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);

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

// ── CS Review Bank ─────────────────────────────────────────────────────────

export async function csAddToReviewBank({ question_id, topic, question_text, mark_scheme, total_marks, first_attempt_score, first_attempt_feedback }) {
  const data = await loadFromDB();
  if (data.review_bank.find(q => q.question_id === question_id)) { await saveToDB(data); return; }
  const locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  data.review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority: first_attempt_score === 0 ? 1 : 2,
    locked_until,
  });
  await saveToDB(data);
}

export async function csGetReviewBank() {
  const data = await loadFromDB();
  return [...data.review_bank].sort((a, b) => a.priority - b.priority);
}

export async function csRemoveFromReviewBank(question_id) {
  const data = await loadFromDB();
  data.review_bank = data.review_bank.filter(q => q.question_id !== question_id);
  await saveToDB(data);
}

export async function csResetReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await saveToDB(data);
  }
}

// ── CS MCQ ─────────────────────────────────────────────────────────────────

export async function csSaveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const normKey = normaliseTopicKey(topic);
  const data = await loadFromDB();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.guess_review_bank) data.guess_review_bank = [];
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

  if (flagged_as_guess) {
    const existing = data.guess_review_bank.find(e => (typeof e === "string" ? e : e.question_id) === question_id);
    if (!existing) {
      data.guess_review_bank.push({ question_id, locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() });
    }
  } else if (correct && !flagged_as_guess) {
    data.guess_review_bank = data.guess_review_bank.filter(e => (typeof e === "string" ? e : e.question_id) !== question_id);
  }

  await saveToDB(data);
}

export async function csGetGuessReviewBank() {
  const data = await loadFromDB();
  return (data.guess_review_bank || []).map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
}