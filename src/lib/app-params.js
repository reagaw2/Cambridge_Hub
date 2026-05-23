// app-params.js — read-only parameter helper.
// Only reads from localStorage / URL; never writes undefined/null values
// back into storage (which was corrupting the browser state).

const isNode = typeof window === 'undefined';

const getAppParamValue = (paramName, { defaultValue = null, removeFromUrl = false } = {}) => {
  if (isNode) return defaultValue;

  const storageKey = `base44_${paramName.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);

  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  // URL param takes priority — persist it for the session
  if (searchParam) {
    localStorage.setItem(storageKey, searchParam);
    return searchParam;
  }

  // Check localStorage for a previously persisted value
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  // Only fall back to the provided defaultValue — never write null/undefined
  return defaultValue ?? null;
};

export const appParams = {
  appId: getAppParamValue('app_id', { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
  token: getAppParamValue('access_token', { removeFromUrl: true }),
  fromUrl: isNode ? null : window.location.href,
  functionsVersion: getAppParamValue('functions_version', { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
  appBaseUrl: getAppParamValue('app_base_url', { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
};
