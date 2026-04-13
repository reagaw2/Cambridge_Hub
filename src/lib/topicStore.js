const STORAGE_KEY = "ala_hub_data";

const DEFAULT_DATA = {
  topics: {
    gravitational_fields: {
      attempts: [],
      last_attempted: null,
      streak: 0,
      last_streak_date: null
    }
  }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    return JSON.parse(raw);
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
    // already recorded today, don't increment
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

  // Trend calculation
  let trend = "steady";
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1];
    if (last >= 2) trend = "improving";
    else if (last === 1) trend = "steady";
    else trend = "needs_work";
  }

  // Last attempted label
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

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}