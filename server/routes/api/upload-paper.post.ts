import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ base64: string; filename: string; contentType: string }>(event);

  if (!body?.base64 || !body?.filename) {
    throw createError({ statusCode: 400, statusMessage: "base64 and filename are required" });
  }

  const supabaseUrl = process.env.NITRO_SUPABASE_URL;
  const serviceKey = process.env.NITRO_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NITRO_SUPABASE_URL and NITRO_SUPABASE_SERVICE_ROLE_KEY must be set in environment variables",
    });
  }

  // Decode base64 to binary
  const binaryStr = atob(body.base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const filePath = `physics/${body.filename}`;
  const bucket = "paper-assets";

  // Upload using service role key — bypasses RLS
  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": body.contentType ?? "application/pdf",
        "x-upsert": "true",
      },
      body: bytes,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw createError({ statusCode: uploadRes.status, statusMessage: `Storage upload failed: ${err}` });
  }

  // Return the public URL
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
  return { url: publicUrl };
});