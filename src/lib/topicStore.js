/**
 * topicStore.js — Student data layer
 * Single source of truth: DB. In-memory cache for the session.
 * Always call preloadStore(userEmail) once after login before reading any data.
 */

import { base44 } from "@/api/base44Client";

let _csCache = null;

// ── Helpers ────────────────────────────────────────────────────────────────

export function toDateString(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * BUG 1 FIX — Normalise any topic name to snake_case.
 * "Physical Quantities & Units" → "physical_quantities_units"
 * "Gravitational Fields" → "gravitational_fields"
 */
export function normaliseTopicKey(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")           // spaces → underscores
    .replace(/[^a-z0-9_]/g, "")     // strip non-alphanumeric except underscores
    .replace(/_+/g, "_")            // collapse consecutive underscores
    .replace(/^_|_$/g, "");         // trim leading/trailing underscores
}

const DEFAULT_DATA = () => ({
  topics: {
    physical_quantities_units: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    kinematics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    forces_equilibrium: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    circular_motion: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    waves: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    gravitational_fields: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    nuclear_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    thermal_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    oscillations: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    electric_fields: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    capacitance: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    electromagnetic_induction: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    quantum_physics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    astrophysics: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
    medical_imaging: { attempts: [], last_attempted: null, streak: 0, last_streak_date: null },
  },
  review_bank: [],
  review_bank_clears: 0,
  mcq_attempts: [],
  guess_review_bank: [],
});

// Module-level state
let _cache = null;
let _recordId = null;
let _userEmail = null;
let _loadPromise = null; // deduplicate concurrent loads

/**
 * Call once after login. Fetches DB record, primes cache.
 * Subsequent reads within the session use the cache.
 */
export async function preloadStore(userEmail) {
  if (_userEmail !== userEmail) {
    // Different user — full reset
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _loadPromise = null;
  }
  // Force a fresh DB fetch (bypasses cache)
  _cache = null;
  _loadPromise = null;
  const result = await loadFromDB();
  console.log("[topicStore] preloadStore complete for", userEmail, "— cache keys:", Object.keys(result.topics || {}));
  return result;
}

/**
 * Returns true once the store has been loaded for the given user.
 * Used by the dashboard to avoid reading before preload completes.
 */
export function isStoreReady(userEmail) {
  return _userEmail === userEmail && _cache !== null;
}

/** Legacy init — keeps existing call sites working, but doesn't force a fetch */
export function initStore(userEmail) {
  if (_userEmail !== userEmail) {
    _cache = null;
    _recordId = null;
    _userEmail = userEmail;
    _loadPromise = null;
  }
}

async function loadFromDB() {
  // Return cached data immediately if available
  if (_cache) return _cache;

  // Deduplicate concurrent calls — only one DB fetch in flight at a time
  if (_loadPromise) return _loadPromise;

  if (!_userEmail) {
    _cache = DEFAULT_DATA();
    return _cache;
  }

  _loadPromise = (async () => {
    try {
      const records = await base44.entities.StudentData.filter({ user_email: _userEmail });
      console.log("[topicStore] raw DB records for", _userEmail, JSON.stringify(records));
      if (records && records.length > 0) {
        // If duplicates exist, use the most recently updated record
        const record = records.sort((a, b) => {
          const ta = a.updated_date ? new Date(a.updated_date).getTime() : 0;
          const tb = b.updated_date ? new Date(b.updated_date).getTime() : 0;
          return tb - ta;
        })[0];
        _recordId = record.id;
        console.log("[topicStore] topics from DB:", JSON.stringify(record.topics));
        console.log("[topicStore] mcq_attempts count:", (record.mcq_attempts || []).length);
        console.log("[topicStore] review_bank count:", (record.review_bank || []).length);
        _cache = {
          topics: record.topics || DEFAULT_DATA().topics,
          review_bank: record.review_bank || [],
          review_bank_clears: record.review_bank_clears ?? 0,
          mcq_attempts: record.mcq_attempts || [],
          guess_review_bank: record.guess_review_bank || [],
        };
      } else {
        console.log("[topicStore] no record found for user, using defaults");
        _cache = DEFAULT_DATA();
      }
    } catch (e) {
      console.warn("topicStore: failed to load from DB", e);
      _cache = DEFAULT_DATA();
    }
    _loadPromise = null;
    return _cache;
  })();

  return _loadPromise;
}

async function saveToDB(data) {
  if (!_userEmail) return;
  _cache = data;

  const payload = {
    user_email: _userEmail,
    topics: data.topics,
    review_bank: data.review_bank,
    review_bank_clears: data.review_bank_clears,
    mcq_attempts: data.mcq_attempts,
    guess_review_bank: data.guess_review_bank,
  };

  try {
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

/**
 * BUG 1 + 2 + 3 FIX:
 * - topicKey is normalised via normaliseTopicKey before writing
 * - attempt is saved as an object { score, total_marks, date, question_id }
 * - console.log confirms the exact key used
 */
export async function recordAttempt(topicKey, score, { total_marks = 1, question_id = null } = {}) {
  const normKey = normaliseTopicKey(topicKey);
  console.log(`[topicStore] recordAttempt — raw key: "${topicKey}" → normalised: "${normKey}", score: ${score}/${total_marks}`);

  const data = await loadFromDB();
  if (!data.topics[normKey]) {
    data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  }

  const topic = data.topics[normKey];
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  // BUG 2 FIX: store as object, not raw number
  topic.attempts.push({ score, total_marks, date: today, question_id });
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
  const normKey = normaliseTopicKey(topicKey);
  console.log(`[topicStore] getTopicData — raw key: "${topicKey}" → normalised: "${normKey}"`);

  const data = await loadFromDB();
  const topic = data.topics[normKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };

  // BUG 2 FIX: filter out legacy raw numbers, keep only proper attempt objects
  const attempts = (topic.attempts || []).filter(a => a !== null && typeof a === "object");
  const { last_attempted } = topic;

  // BUG 1 FIX: MCQ attempts are now stored with normalised key, look them up the same way
  const mcqAttempts = (data.mcq_attempts || []).filter(a => normaliseTopicKey(a.topic) === normKey);

  console.log(`[topicStore] getTopicData(${normKey}): attempts=${JSON.stringify(attempts)}, last_attempted=${last_attempted}, mcqAttempts=${mcqAttempts.length}`);

  const hasWritten = attempts.length > 0;
  const hasMCQ = mcqAttempts.length > 0;

  if (!hasWritten && !hasMCQ) return null;

  // ── Trend: based on most recent attempt (written takes priority if same session) ──
  let trend = "steady";
  if (hasWritten) {
    const last = attempts[attempts.length - 1];
    const score = last.score ?? 0;
    const total = last.total_marks ?? 1;
    const ratio = total > 0 ? score / total : 0;
    if (score === 0) trend = "needs_work";
    else if (ratio >= 1) trend = "improving";
    else trend = "steady"; // partial marks
  }

  // If there are MCQ attempts more recent than the last written attempt, let them influence trend
  if (hasMCQ) {
    const today = toDateString(new Date());
    const lastMCQ = mcqAttempts[mcqAttempts.length - 1];
    const lastWrittenDate = last_attempted;
    // Use MCQ trend only if no written attempts, or MCQ is more recent
    const mcqIsMoreRecent = !lastWrittenDate || lastMCQ.date >= lastWrittenDate;
    if (!hasWritten || mcqIsMoreRecent) {
      if (lastMCQ.correct && !lastMCQ.flagged_as_guess) trend = "improving";
      else if (lastMCQ.correct && lastMCQ.flagged_as_guess) trend = "steady";
      else trend = "needs_work";
    }
  }

  // ── Last attempted date ──
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
      // Calculate days ago from dd/mm/yyyy format
      const parts = latestDate.split("/");
      if (parts.length === 3) {
        const dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diffMs = new Date() - dateObj;
        const diffDays = Math.floor(diffMs / 86400000);
        lastLabel = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
      } else {
        lastLabel = latestDate;
      }
    }
  }

  // ── Streak: count consecutive days with at least one attempt ending today or yesterday ──
  // Collect all attempt dates (written + MCQ)
  const writtenDates = last_attempted ? [last_attempted] : [];
  // For written attempts we only have last_attempted, not per-attempt dates.
  // Use mcq dates + last_attempted for written topics.
  const allDates = new Set([
    ...writtenDates,
    ...mcqAttempts.map(a => a.date),
  ]);

  // Also include per-day written data from streak tracking in topic object
  // The streak field on the topic is already maintained by recordAttempt.
  // We trust it unless it's stale (last_streak_date is older than yesterday → reset to 0).
  let currentStreak = topic.streak || 0;
  const lastStreakDate = topic.last_streak_date || null;
  if (lastStreakDate && lastStreakDate !== today && lastStreakDate !== yesterday) {
    currentStreak = 0;
  }

  // For MCQ-only topics, recompute streak from MCQ attempt dates
  if (!hasWritten && hasMCQ) {
    const days = [...new Set(mcqAttempts.map(a => a.date))].sort();
    let s = 0;
    let checkDate = today;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] === checkDate || (s === 0 && days[i] === yesterday)) {
        if (s === 0 && days[i] === yesterday) {
          // Allow streak starting from yesterday
        }
        if (days[i] === checkDate) {
          s++;
          const parts = checkDate.split("/");
          const prevDay = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          prevDay.setDate(prevDay.getDate() - 1);
          checkDate = toDateString(prevDay);
        } else {
          break;
        }
      } else {
        break;
      }
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
  const locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  data.review_bank.push({
    question_id, topic, question_text, mark_scheme, total_marks,
    first_attempt_score, first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority,
    locked_until,
  });

  await saveToDB(data);
}

export async function resetReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.review_bank.find(q => q.question_id === question_id);
  if (entry) {
    entry.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await saveToDB(data);
  }
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
  const normKey = normaliseTopicKey(topic);
  console.log(`[topicStore] saveMCQAttempt — raw key: "${topic}" → normalised: "${normKey}"`);

  const data = await loadFromDB();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.guess_review_bank) data.guess_review_bank = [];

  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  const attempt = {
    question_id,
    topic,  // keep original display name for UI display
    source, chosen_option, correct_option, correct,
    flagged_as_guess, reasoning,
    date: today,
  };

  data.mcq_attempts.push(attempt);

  // Step 3: also write to topics object under normalised key so getTopicData can read it
  if (!data.topics[normKey]) {
    data.topics[normKey] = { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  }
  const topicEntry = data.topics[normKey];
  const score = correct ? 1 : 0;
  topicEntry.attempts.push({ score, total_marks: 1, date: today, question_id });
  topicEntry.last_attempted = today;

  if (topicEntry.last_streak_date === today) {
    // already recorded today
  } else if (topicEntry.last_streak_date === yesterday) {
    topicEntry.streak = (topicEntry.streak || 0) + 1;
  } else {
    topicEntry.streak = 1;
  }
  topicEntry.last_streak_date = today;

  if (flagged_as_guess) {
    const existing = data.guess_review_bank.find(e => (typeof e === "string" ? e : e.question_id) === question_id);
    if (!existing) {
      const locked_until = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      data.guess_review_bank.push({ question_id, locked_until });
    }
  } else if (correct && !flagged_as_guess) {
    data.guess_review_bank = data.guess_review_bank.filter(e => (typeof e === "string" ? e : e.question_id) !== question_id);
  }

  await saveToDB(data);
  console.log(`[topicStore] saveMCQAttempt complete — topics object:`, JSON.stringify(data.topics));
}

/**
 * Returns unique display names of topics that have MCQ attempts,
 * excluding any that are already in the written topics list.
 */
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

export async function getGuessReviewBank() {
  const data = await loadFromDB();
  // Normalise legacy string entries to objects
  return (data.guess_review_bank || []).map(e =>
    typeof e === "string" ? { question_id: e, locked_until: null } : e
  );
}

export async function preloadCSStore(userEmail) {
  try {
    const records = await base44.entities.StudentData.filter({ user_email: userEmail });
    const record = records.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))[0];
    _csCache = record?.cs_data || { topics: {}, cs_review_bank: [], cs_guess_review_bank: [] };
    console.log("[csStore] raw DB cs_data for", userEmail, ":", _csCache);
  } catch (e) {
    _csCache = { topics: {}, cs_review_bank: [], cs_guess_review_bank: [] };
    console.log("[csStore] error loading cs_data:", e);
  }
}

export async function resetGuessReviewBankLock(question_id) {
  const data = await loadFromDB();
  const entry = data.guess_review_bank.find(e =>
    (typeof e === "string" ? e : e.question_id) === question_id
  );
  if (entry && typeof entry === "object") {
    entry.locked_until = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    await saveToDB(data);
  } else if (typeof entry === "string") {
    const idx = data.guess_review_bank.indexOf(entry);
    data.guess_review_bank[idx] = {
      question_id,
      locked_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    };
    await saveToDB(data);
  }
}