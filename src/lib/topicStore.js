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
    // ensure review_bank fields exist on older data
    if (!data.review_bank) data.review_bank = [];
    if (data.review_bank_clears == null) data.review_bank_clears = 0;
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

export function getTopicData(topicKey) {
  const data = load();
  const topic = data.topics[topicKey];
  if (!topic) return null;

  const { attempts, last_attempted, streak } = topic;

  let trend = "steady";
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1];
    if (last >= 2) trend = "improving";
    else if (last === 1) trend = "steady";
    else trend = "needs_work";
  }

  let lastLabel = null;
  if (last_attempted) {
    const today = toDateString(new Date());
    const yesterday = toDateString(new Date(Date.now() - 86400000));
    if (last_attempted === today) lastLabel = "Today";
    else if (last_attempted === yesterday) lastLabel = "Yesterday";
    else lastLabel = last_attempted;
  }

  return { trend, streak: streak || 0, lastLabel, attempts };
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