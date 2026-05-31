/**
 * p1PaperStore.js — manages past paper PDFs in Supabase Storage.
 * Supports multiple papers, each stored at its own path in the bucket.
 */

import { supabaseClient } from "@/api/base44Client";

const BUCKET = "paper-assets";

// Registry of known papers — filename must match exactly what is in Supabase Storage
const PAPER_FILES = {
  "9702/12/F/M/25": "9702_m25_qp_12.pdf",
  "9702/12/M/J/22": "9702_s22_qp_12.pdf",
  "9702/11/M/J/22": "9702_s22_qp_11.pdf",
  "9702/13/O/N/20": "9702_w20_qp_13.pdf",
};

/**
 * Get the public URL for a specific paper PDF.
 */
export function getPaperPdfUrl(paperId) {
  const filename = PAPER_FILES[paperId];
  if (!filename) return Promise.resolve(null);

  const { data } = supabaseClient.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  if (data?.publicUrl) {
    return Promise.resolve(data.publicUrl);
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return Promise.resolve(null);

  return Promise.resolve(
    `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filename}`
  );
}

/**
 * Upload a PDF via the server-side route (bypasses RLS).
 */
export async function uploadPaperPdf(file, paperId) {
  const filename = PAPER_FILES[paperId] ?? file.name;

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
    return { url: data.url ?? null, error: null };
  } catch (e) {
    return { url: null, error: e.message };
  }
}