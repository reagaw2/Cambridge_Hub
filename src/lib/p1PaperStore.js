/**
 * p1PaperStore.js — manages past paper PDFs in Supabase Storage.
 * Supports multiple papers, each stored at its own path in the bucket.
 */

import { supabaseClient } from "@/api/base44Client";

const BUCKET = "paper-assets";

// Registry of known papers — add new entries here as PDFs are uploaded
const PAPER_FILES = {
  "9702/12/F/M/25": "9702_m25_qp_12.pdf",
  "9702/12/M/J/22": "9702_s22_qp_12.pdf",
  "9702/11/M/J/22": "9702_s22_qp_11.pdf",
};

function localCacheKey(paperId) {
  return `p1_paper_url_${(paperId ?? "").replace(/\//g, "_")}`;
}

/**
 * Get the public URL for a specific paper PDF.
 */
export async function getPaperPdfUrl(paperId) {
  const filename = PAPER_FILES[paperId];
  if (!filename) return null;

  const cacheKey = localCacheKey(paperId);

  // Check local cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const { data } = supabaseClient.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    if (data?.publicUrl) {
      const check = await fetch(data.publicUrl, { method: "HEAD" }).catch(() => null);
      if (check?.ok) {
        localStorage.setItem(cacheKey, data.publicUrl);
        return data.publicUrl;
      }
    }
  } catch {
    // Storage not configured
  }

  return null;
}

/**
 * Upload a PDF via the server-side route (bypasses RLS).
 */
export async function uploadPaperPdf(file, paperId) {
  const filename = PAPER_FILES[paperId] ?? file.name;
  const cacheKey = localCacheKey(paperId);

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64Str = typeof result === "string" ? result.split(",")[1] : null;
        if (base64Str) resolve(base64Str);
        else reject(new Error("Failed to read file as base64"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch("/api/upload-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64,
        filename,
        contentType: "application/pdf",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { url: null, error: errText || `Server error ${res.status}` };
    }

    const data = await res.json();
    const url = data.url ?? null;
    if (url) localStorage.setItem(cacheKey, url);
    return { url, error: null };
  } catch (e) {
    return { url: null, error: e.message };
  }
}

/**
 * Clear the local URL cache for a paper (forces a fresh check from Supabase).
 */
export function clearPaperUrlCache(paperId) {
  localStorage.removeItem(localCacheKey(paperId));
}