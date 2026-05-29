/**
 * p1PaperStore.js — manages the past paper PDF in Supabase Storage.
 * 
 * The PDF is uploaded once to a public Supabase Storage bucket.
 * All devices then fetch the same public URL — fully cross-device.
 */

import { supabaseClient } from "@/api/base44Client";

const BUCKET = "paper-assets";
const FILE_PATH = "physics/9702_m25_qp_12.pdf";
const LOCAL_URL_KEY = "p1_paper_url_9702_m25_qp_12";

/**
 * Get the public URL for the paper PDF.
 * Checks localStorage cache first, then Supabase Storage.
 * Returns null if not yet uploaded.
 */
export async function getPaperPdfUrl() {
  // Check local cache first (avoids a network round-trip on repeat visits)
  const cached = localStorage.getItem(LOCAL_URL_KEY);
  if (cached) return cached;

  try {
    const { data } = supabaseClient.storage
      .from(BUCKET)
      .getPublicUrl(FILE_PATH);

    if (data?.publicUrl) {
      // Verify the file actually exists with a HEAD request
      const check = await fetch(data.publicUrl, { method: "HEAD" }).catch(() => null);
      if (check?.ok) {
        localStorage.setItem(LOCAL_URL_KEY, data.publicUrl);
        return data.publicUrl;
      }
    }
  } catch {
    // Storage not configured — return null gracefully
  }

  return null;
}

/**
 * Upload the PDF to Supabase Storage.
 * Called once from the admin upload flow.
 * @param {File} file — the PDF File object
 * @returns {{ url: string | null, error: string | null }}
 */
export async function uploadPaperPdf(file) {
  try {
    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET)
      .upload(FILE_PATH, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabaseClient.storage
      .from(BUCKET)
      .getPublicUrl(FILE_PATH);

    const url = data?.publicUrl ?? null;
    if (url) localStorage.setItem(LOCAL_URL_KEY, url);
    return { url, error: null };
  } catch (e) {
    return { url: null, error: e.message };
  }
}

/**
 * Clear the local URL cache (forces a fresh fetch from Supabase).
 */
export function clearPaperUrlCache() {
  localStorage.removeItem(LOCAL_URL_KEY);
}