/**
 * userSession.js — synchronous user ID tracker.
 * Call setSessionUserId() from AuthContext when user changes.
 * Import getSessionUserId() in any store that writes localStorage.
 */
let _userId = null;

export function setSessionUserId(id) {
  _userId = id ?? null;
}

export function getSessionUserId() {
  return _userId ?? "anon";
}