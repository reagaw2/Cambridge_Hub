const STORAGE_KEY = "ala_hub_data";

const DEFAULT_DATA = {
  topics: {
    gravitational_fields: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    nuclear_physics: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    thermal_physics: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    oscillations: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    electric_fields: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    capacitance: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    electromagnetic_induction: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    quantum_physics: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    },
    astrophysics: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    }
  },
  review_bank: [],
  review_bank_clears: 0
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const data = JSON.parse(raw);
    // ensure fields exist on older data
    if (!data.review_bank) data.review_bank = [];
    if (data.review_bank_clears == null) data.review_bank_clears = 0;
    if (!data.mcq_attempts) data.mcq_attempts = [];
    if (!data.guess_review_bank) data.guess_review_bank = [];
    return data;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toDateString(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Topic attempts ─────────────────────────────────────────────────────────

export function recordAttempt(topicKey, score) {
  const data = load();
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
  save(data);
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
  // MCQ-only topics use their display name as the key too
  "Physical Quantities & Units": "Physical Quantities & Units",
  "Dynamics & Newton's Laws": "Dynamics & Newton's Laws",
  "Momentum & Collisions": "Momentum & Collisions",
  "Forces, Torques & Equilibrium": "Forces, Torques & Equilibrium",
  "Work, Energy & Power": "Work, Energy & Power",
  "Deformation of Solids": "Deformation of Solids",
  "Waves": "Waves",
  "Electricity": "Electricity",
  "Nuclear Physics & Particle Physics": "Nuclear Physics & Particle Physics",
};

export function getTopicData(topicKey) {
  const data = load();
  const topic = data.topics[topicKey] || { attempts: [], last_attempted: null, streak: 0, last_streak_date: null };
  const { attempts, last_attempted, streak } = topic;

  // Get MCQ attempts for this topic
  const displayName = TOPIC_KEY_TO_DISPLAY[topicKey] ?? topicKey;
  const mcqAttempts = (data.mcq_attempts || []).filter(a => a.topic === displayName);

  const hasWritten = attempts.length > 0;
  const hasMCQ = mcqAttempts.length > 0;

  if (!hasWritten && !hasMCQ) return null;

  // --- Trend ---
  let trend = "steady";
  if (hasWritten) {
    const last = attempts[attempts.length - 1];
    if (last >= 2) trend = "improving";
    else if (last === 1) trend = "steady";
    else trend = "needs_work";
  } else {
    // MCQ-only trend
    const lastMCQ = mcqAttempts[mcqAttempts.length - 1];
    if (lastMCQ.correct && !lastMCQ.flagged_as_guess) trend = "improving";
    else if (lastMCQ.correct && lastMCQ.flagged_as_guess) trend = "steady";
    else trend = "needs_work";
  }

  // --- Last attempted date (most recent of written or MCQ) ---
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

  // --- Streak: use written streak if available, else count MCQ streak ---
  let currentStreak = streak || 0;
  if (!hasWritten && hasMCQ) {
    // Count consecutive days with MCQ attempts ending today/yesterday
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

export function addToReviewBank({ question_id, topic, question_text, mark_scheme, total_marks, first_attempt_score, first_attempt_feedback }) {
  const data = load();
  // avoid duplicates
  if (data.review_bank.find(q => q.question_id === question_id)) { save(data); return; }

  const priority = first_attempt_score === 0 ? 1 : 2;

  data.review_bank.push({
    question_id,
    topic,
    question_text,
    mark_scheme,
    total_marks,
    first_attempt_score,
    first_attempt_feedback,
    date_added: toDateString(new Date()),
    priority
  });

  save(data);
}

export function removeFromReviewBank(question_id) {
  const data = load();
  data.review_bank = data.review_bank.filter(q => q.question_id !== question_id);
  save(data);
}

export function getReviewBank() {
  const data = load();
  return [...data.review_bank].sort((a, b) => a.priority - b.priority);
}

export function incrementReviewBankClears() {
  const data = load();
  data.review_bank_clears = (data.review_bank_clears || 0) + 1;
  save(data);
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── MCQ Attempts ───────────────────────────────────────────────────────────

export function saveMCQAttempt({ question_id, topic, source, chosen_option, correct_option, correct, flagged_as_guess, reasoning }) {
  const data = load();
  if (!data.mcq_attempts) data.mcq_attempts = [];
  if (!data.guess_review_bank) data.guess_review_bank = [];

  const attempt = {
    question_id,
    topic,
    source,
    chosen_option,
    correct_option,
    correct,
    flagged_as_guess,
    reasoning,
    date: toDateString(new Date()),
  };

  data.mcq_attempts.push(attempt);

  // Guess review bank logic
  if (flagged_as_guess) {
    // Add to guess review bank if not already present
    if (!data.guess_review_bank.includes(question_id)) {
      data.guess_review_bank.push(question_id);
    }
  } else if (correct && !flagged_as_guess) {
    // Remove from guess review bank if now answered correctly without guessing
    data.guess_review_bank = data.guess_review_bank.filter(id => id !== question_id);
  }

  save(data);

  // Step 6 — console verification
  console.log("MCQ attempt saved:", attempt);
  console.log("Guess review bank:", data.guess_review_bank);
  console.log(`MCQ stats for ${topic}:`, getMCQStatsForTopic(topic, data));
}

function getMCQStatsForTopic(topic, data) {
  const attempts = (data.mcq_attempts || []).filter(a => a.topic === topic);
  if (attempts.length === 0) return null;
  const total_attempted = attempts.length;
  const reasoned_correct = attempts.filter(a => a.correct && !a.flagged_as_guess).length;
  const guessed = attempts.filter(a => a.flagged_as_guess).length;
  const reasoned_correct_percentage = Math.round((reasoned_correct / total_attempted) * 100);
  return { total_attempted, reasoned_correct, guessed, reasoned_correct_percentage };
}

export function getMCQStats(topic) {
  const data = load();
  return getMCQStatsForTopic(topic, data);
}

export function getGuessReviewBank() {
  const data = load();
  return data.guess_review_bank || [];
}