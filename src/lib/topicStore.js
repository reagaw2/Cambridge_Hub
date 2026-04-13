const KEY = "ala_topics";

// Clear legacy data on load — ensures dev-phase test scores don't persist
(function resetLegacyData() {
  try {
    const store = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (store["Gravitational Fields"]) {
      delete store["Gravitational Fields"];
      localStorage.setItem(KEY, JSON.stringify(store));
    }
  } catch {}
  // Run once then remove self so future loads don't wipe real data
})();

// Remove the self-resetting block after first run by persisting a flag
const RESET_FLAG = "ala_reset_v2";
if (!localStorage.getItem(RESET_FLAG)) {
  try {
    const store = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    delete store["Gravitational Fields"];
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
  localStorage.setItem(RESET_FLAG, "1");
}

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

  // Trend based solely on the most recent score (2 = improving, 1 = steady, 0 = needs work)
  // Single attempt defaults to steady — not enough data
  let trend = "steady";
  if (attempts.length >= 2) {
    if (last >= 2) trend = "improving";
    else if (last === 1) trend = "steady";
    else trend = "needs_work";
  }

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