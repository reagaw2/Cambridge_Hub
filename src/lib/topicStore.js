/**
 * topicStore.js — Student data layer
 * Reads/writes from the StudentData entity (DB), keyed by user email.
 * Falls back gracefully if data not yet created.
 */

import { base44 } from "@/api/base44Client";

// ── Helpers ────────────────────────────────────────────────────────────────

export function toDateString(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const DEFAULT_DATA = () => ({
  topics: {
    gravitational_fields: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    nuclear_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    thermal_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    oscillations: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    electric_fields: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    capacitance: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    electromagnetic_induction: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    quantum_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    astrophysics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
  },
  review_bank: [],
  review_bank_clears: 0,
  mcq_attempts: [],
  guess_review_bank: [],
});

// In-memory cache so we don't fetch from DB on every call within a session
let _cache = null;
let _recordId = null;
let _userEmail = null;

export function initStore(userEmail) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
  }
}

async function loadFromDB() {
  if (_cache) return _cache;
  if (!_userEmail) return DEFAULT_DATA();

  try {
    const records = await base44.entities.StudentData.filter({ user_email: _userEmail });
    if (records && records.length > 0) {
      const record = records[0];
      _recordId = record.id;
      const data = {
        topics: record.topics || DEFAULT_DATA().topics,
        review_bank: record.review_bank || [],
        review_bank_clears: record.review_bank_clears ?? 0,
        mcq_attempts: record.mcq_attempts || [],
        guess_review_bank: record.guess_review_bank || [],
      };
      _cache = data;
      return data;
    }
  } catch (e) {
    console.warn("topicStore: failed to load from DB", e);
  }

  _cache = DEFAULT_DATA();
  return _cache;
}

async function saveToDB(data) {
  if (!_userEmail) return;
  _cache = data;

  try {
    const payload = {
      user_email: _userEmail,
      topics: data.topics,
      review_bank: data.review_bank,
      review_bank_clears: data.review_bank_clears,
      mcq_attempts: data.mcq_attempts,
      guess_review_bank: data.guess_review_bank,
    };

    if (_recordId) {
      await base44.entities.StudentData.update(_recordId, payload);
    } else {
      const created = await base44.entities.StudentData.create(payload);
      _recordId = created.id;
    }
  } catch (e) {
    console.warn("topicStore: failed to save to DB", e);
  }
}

// ── Topic attempts ─────────────────────────────────────────────────────────

export async function recordAttempt(topicKey, score) {
  const data = await loadFromDB();
  if (!data.topics[topicKey]) {
    data.topics[topicKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  }

  const topic = data.topics[topicKey];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  topic.attempts.push(score);
  topic.last_attempted = today;

  if (topic.last_streak_date === today) {
    // already recorded today — don't increment
  } else if (topic.last_streak_date === yesterday) {
    topic.streak = (topic.streak || 0) + 1;
  } else {
    topic.streak = 1;
  }

  topic.last_streak_date = today;
  await saveToDB(data);
}

// Maps topicKey (snake_case) to the topic display name used in mcq_attempts
const TOPIC_KEY_TO_DISPLAY = {
  gravitational_fields: "Gravitational Fields",
  nuclear_physics: "Nuclear Physics",
  thermal_physics: "Thermal Physics",
  oscillations: "Oscillations",
  electric_fields: "Electric Fields",
  capacitance: "Capacitance",
  electromagnetic_induction: "Electromagnetic Induction",
  quantum_physics: "Quantum Physics",
  astrophysics: "Astrophysics",
};

export async function getTopicData(topicKey) {
  const data = await loadFromDB();
  const topic = data.topics[topicKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const { attempts, last_attempted, streak } = topic;

  const displayName = TOPIC_KEY_TO_DISPLAY[topicKey] ?? topicKey;
  const mcqAttempts = (data.mcq_attempts || []).filter(a => a.topic === displayName);

  const hasWritten = attempts.length > 0;
  const hasMCQ = mcqAttempts.length > 0;

  if (!hasWritten && !hasMCQ) return null;

  let trend = "steady";
  if (hasWritten) {
    const last = attempts[attempts.length - 1];
    if (last >= 2) trend = "improving";
    else if (last === 1) trend = "steady";
    else trend = "needs_work";
  } else {
    const lastMCQ = mcqAttempts[mcqAttempts.length - 1];
    if (lastMCQ.correct && !lastMCQ.flagged_as_guess) trend = "improving";
    else if (lastMCQ.correct && lastMCQ.flagged_as_guess) trend = "steady";
    else trend = "needs_work";
  }

  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  let latestDate = last_attempted;
  if (hasMCQ) {
    const lastMCQDate = mcqAttempts[mcqAttempts.length - 1].date;
    if (!latestDate || lastMCQDate > latestDate) latestDate = lastMCQDate;
  }

  let lastLabel = null;
  if (latestDate) {
    if (latestDate === today) lastLabel = "Today";
    else if (latestDate === yesterday) lastLabel = "Yesterday";
    else lastLabel = latestDate;
  }

  let currentStreak = streak || 0;
  if (!hasWritten && hasMCQ) {
    const days = [...new Set(mcqAttempts.map(a => a.date))].sort();
    let s = 0;
    let checkDate = today;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] === checkDate) {
        s++;
        checkDate = toDateString(new Date(new Date(checkDate.split("/").reverse().join("-")).getTime() - 86400000));
      } else break;
    }
    currentStreak = s;
  }

  return { trend, streak: currentStreak, lastLabel, attempts };
}

// ── Review Bank ────────────────────────────────────────────────────────────

export async function addToReviewBank({ question_id, topic, question_text, mark_scheme, total_marks, first_attempt_score, first_attempt_feedback }) {
  const data = await loadFromDB();
  if (data.review_bank.find(q => q.question_id === question_id)) { await saveToDB(data); return; }

  const priority = first_attempt_score === 0 ? 1 : 2;
  data.review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority,
  });

  await saveToDB(data);
}

export async function removeFromReviewBank(question_id) {
  const data = await loadFromDB();
  data.review_bank = data.review_bank.filter(q => q.question_id !== question_id);
  await saveToDB(data);
}

export async function getReviewBank() {
  const data = await loadFromDB();
  return [...data.review_bank].sort((a, b) => a.priority - b.priority);
}

export async function incrementReviewBankClears() {
  const data = await loadFromDB();
  data.review_bank_clears = (data.review_bank_clears || 0) + 1;
  await saveToDB(data);
}

export async function resetData() {
  _cache = DEFAULT_DATA();
  if (_recordId && _userEmail) {
    try {
      await base44.entities.StudentData.update(_recordId, {
        ..._cache,
        user_email: _userEmail,
      });
    } catch (e) {
      console.warn("topicStore: failed to reset data", e);
    }
  }
}

// ── MCQ Attempts ───────────────────────────────────────────────────────────

export async function saveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const data = await loadFromDB();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.guess_review_bank) data.guess_review_bank = [];

  const attempt = {
    question_id, topic, source, chosen_option, correct_option, correct,
    flagged_as_guess, reasoning,
    date: toDateString(new Date()),
  };

  data.mcq_attempts.push(attempt);

  if (flagged_as_guess) {
    if (!data.guess_review_bank.includes(question_id)) {
      data.guess_review_bank.push(question_id);
    }
  } else if (correct && !flagged_as_guess) {
    data.guess_review_bank = data.guess_review_bank.filter(id => id !== question_id);
  }

  await saveToDB(data);
  console.log("MCQ attempt saved:", attempt);
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

export async function getGuessReviewBank() {
  const data = await loadFromDB();
  return data.guess_review_bank || [];
}