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
  const first = attempts[0];
  const last = attempts[attempts.length - 1];

  let trend = "steady";
  if (last > first) trend = "improving";
  else if (last < first) trend = "needs_work";

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