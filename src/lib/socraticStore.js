/**
 * socraticStore.js — lightweight in-memory cache for Socratic conversations.
 * Keyed by `${questionId}__${markNotation}_${markIdx}` so each missed mark
 * has its own independent thread that survives panel toggling within a session.
 */

const _threads = {};

export function getSocraticThread(key) {
  return _threads[key] ?? [];
}

export function appendSocraticMessage(key, message) {
  if (!_threads[key]) _threads[key] = [];
  _threads[key] = [..._threads[key], message];
  return _threads[key];
}

export function clearSocraticThread(key) {
  _threads[key] = [];
}

export function buildThreadKey(questionId, markIdx) {
  return `${questionId ?? "unknown"}__mark_${markIdx}`;
}