/**
 * p1PaperStore.js — manages the past paper PDF in Supabase Storage.
 * Upload goes through a server-side Nitro route to bypass RLS.
 * All devices fetch the same public URL — fully cross-device.
 */

import { supabaseClient } from "@/api/base44Client";

const BUCKET = "paper-assets";
const FILE_PATH = "physics/9702_m25_qp_12.pdf";
const LOCAL_URL_KEY = "p1_paper_url_9702_m25_qp_12";

/**
 * Get the public URL for the paper PDF.
 * Checks localStorage cache first, then derives from Supabase config.
 */
export async function getPaperPdfUrl() {
  // Check local cache first
  const cached = localStorage.getItem(LOCAL_URL_KEY);
  if (cached) return cached;

  try {
    const { data } = supabaseClient.storage
      .from(BUCKET)
      .getPublicUrl(FILE_PATH);

    if (data?.publicUrl) {
      // Verify the file actually exists
      const check = await fetch(data.publicUrl, { method: "HEAD" }).catch(() => null);
      if (check?.ok) {
        localStorage.setItem(LOCAL_URL_KEY, data.publicUrl);
        return data.publicUrl;
      }
    }
  } catch {
    // Storage not configured
  }

  return null;
}

/**
 * Upload the PDF via the server-side route (bypasses RLS).
 * @param {File} file
 * @returns {{ url: string | null, error: string | null }}
 */
export async function uploadPaperPdf(file) {
  try {
    // Read file as base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data URL prefix, keep only base64 string
        const result = reader.result;
        const base64Str = typeof result === "string"
          ? result.split(",")[1]
          : null;
        if (base64Str) resolve(base64Str);
        else reject(new Error("Failed to read file as base64"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Send to server route
    const res = await fetch("/api/upload-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64,
        filename: "9702_m25_qp_12.pdf",
        contentType: "application/pdf",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { url: null, error: errText || `Server error ${res.status}` };
    }

    const data = await res.json();
    const url = data.url ?? null;
    if (url) localStorage.setItem(LOCAL_URL_KEY, url);
    return { url, error: null };
  } catch (e) {
    return { url: null, error: e.message };
  }
}

/**
 * Clear the local URL cache (forces a fresh check from Supabase).
 */
export function clearPaperUrlCache() {
  localStorage.removeItem(LOCAL_URL_KEY);
}