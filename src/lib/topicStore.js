const KEY = "ala_topics";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } 
  catch { return {}; }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordAttempt(topicName, score) {
  const store = load();
  const topic = store[topicName] ?? { attempts: [], streak: 0, lastAttemptedDate: null };

  topic.attempts.push(score);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (topic.lastAttemptedDate !== today) {
    topic.streak = topic.lastAttemptedDate === yesterday ? topic.streak + 1 : 1;
  }
  topic.lastAttemptedDate = today;

  store[topicName] = topic;
  save(store);
}

export function getTopicData(topicName) {
  const store = load();
  const topic = store[topicName];
  if (!topic || topic.attempts.length === 0) return null;

  const { attempts, streak, lastAttemptedDate } = topic;
  const last = attempts[attempts.length - 1];
  const prev = attempts.length >= 2 ? attempts[attempts.length - 2] : null;
  const recent = attempts.slice(-3);
  const maxPossible = 2; // marks out of 2
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  let trend = "steady";

  // Step 3 — two consecutive full marks = Improving
  if (last >= maxPossible && prev !== null && prev >= maxPossible) {
    trend = "improving";
  }
  // Step 1 — last three non-decreasing = Improving
  else if (recent.length >= 2 && recent.every((s, i) => i === 0 || s >= recent[i - 1])) {
    trend = "improving";
  }
  // Step 2 — Needs work only when all three conditions met
  else if (
    attempts.length >= 2 &&
    recentAvg < maxPossible * 0.5 &&
    (prev === null || last <= prev)
  ) {
    trend = "needs_work";
  }
  // Step 4 — never Needs work on a full mark
  if (last >= maxPossible && trend === "needs_work") trend = "steady";

  let lastLabel = "Unknown";
  if (lastAttemptedDate) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastAttemptedDate === today) lastLabel = "Today";
    else if (lastAttemptedDate === yesterday) lastLabel = "Yesterday";
    else {
      const diff = Math.round((Date.now() - new Date(lastAttemptedDate)) / 86400000);
      lastLabel = `${diff} days ago`;
    }
  }

  return { trend, streak, lastLabel, attempts };
}