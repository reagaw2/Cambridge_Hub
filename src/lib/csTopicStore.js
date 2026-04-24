/**
 * csTopicStore.js — Computer Science student data layer
 * All CS data is stored inside StudentData.cs_data on the student's record.
 * Completely separate from Physics topicStore.
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
        const record = records.sort((a, b) => {
          const ta = a.updated_date ? new Date(a.updated_date).getTime() : 0;
          const tb = b.updated_date ? new Date(b.updated_date).getTime() : 0;
          return tb - ta;
        })[0];
        _recordId = record.id;
        const raw = record.cs_data;
        if (raw && typeof raw === "object" && Object.keys(raw).length > 0) {
          _cache = {
            topics: raw.topics || {},
            cs_review_bank: raw.cs_review_bank || [],
            cs_review_bank_clears: raw.cs_review_bank_clears ?? 0,
            cs_mcq_attempts: raw.cs_mcq_attempts || [],
            cs_guess_review_bank: raw.cs_guess_review_bank || [],
          };
        } else {
          _cache = DEFAULT_CS_DATA();
        }
      } else {
        _cache = DEFAULT_CS_DATA();
      }
    } catch (e) {
      console.warn("[csStore] failed to load from DB", e);
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
        const record = records.sort((a, b) => {
          const ta = a.updated_date ? new Date(a.updated_date).getTime() : 0;
          const tb = b.updated_date ? new Date(b.updated_date).getTime() : 0;
          return tb - ta;
        })[0];
        _recordId = record.id;
        await base44.entities.StudentData.update(_recordId, { cs_data: data });
      } else {
        const created = await base44.entities.StudentData.create({ user_email: _userEmail, cs_data: data });
        _recordId = created.id;
      }
    }
  } catch (e) {
    console.warn("[csStore] failed to save to DB", e);
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
  await recordGlobalQuestionAnswered();
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
  if (data.cs_review_bank.find(q => q.question_id === question_id)) { await saveToDB(data); return; }
  const locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  data.cs_review_bank.push({
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
  return [...(data.cs_review_bank || [])].sort((a, b) => a.priority - b.priority);
}

export async function csRemoveFromReviewBank(question_id) {
  const data = await loadFromDB();
  data.cs_review_bank = data.cs_review_bank.filter(q => q.question_id !== question_id);
  await saveToDB(data);
}

export async function csResetReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.cs_review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await saveToDB(data);
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

  await saveToDB(data);
  await recordGlobalQuestionAnswered();
}

export async function csGetGuessReviewBank() {
  const data = await loadFromDB();
  return (data.cs_guess_review_bank || []).map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
}