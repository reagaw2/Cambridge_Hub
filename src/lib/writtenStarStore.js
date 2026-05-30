function key(subject) {
  return `written_starred_${subject ?? "physics"}_v1`;
}

function readAll(subject) {
  try { return JSON.parse(localStorage.getItem(key(subject)) ?? "{}"); } catch { return {}; }
}
function writeAll(subject, data) {
  try { localStorage.setItem(key(subject), JSON.stringify(data)); } catch {}
}

export function isStarred(questionId, subject = "physics") {
  return !!readAll(subject)[questionId];
}

export function starQuestion(questionId, { topic = "", questionText = "", markScheme = "", feedback = null, answer = "" } = {}, subject = "physics") {
  const all = readAll(subject);
  all[questionId] = {
    questionId,
    topic,
    questionText,
    markScheme,
    feedback,
    answer,
    subject,
    teacherQuestion: all[questionId]?.teacherQuestion ?? "",
    teacherResponse: all[questionId]?.teacherResponse ?? "",
    starredAt: new Date().toISOString(),
  };
  writeAll(subject, all);
  return all;
}

export function unstarQuestion(questionId, subject = "physics") {
  const all = readAll(subject);
  delete all[questionId];
  writeAll(subject, all);
  return all;
}

export function saveTeacherQuestion(questionId, teacherQuestion, subject = "physics") {
  const all = readAll(subject);
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherQuestion };
    writeAll(subject, all);
  }
  return all;
}

export function saveTeacherResponse(questionId, teacherResponse, subject = "physics") {
  const all = readAll(subject);
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherResponse };
    writeAll(subject, all);
  }
  return all;
}

export function getAllStarred(subject = "physics") {
  return Object.values(readAll(subject)).sort((a, b) => new Date(a.starredAt) - new Date(b.starredAt));
}