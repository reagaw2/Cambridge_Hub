import { useState, useEffect } from "react";
import { FileText, Download, Loader2, Upload, X } from "lucide-react";
import { getPaperPdfUrl, uploadPaperPdf } from "@/lib/p1PaperStore";
import { useAuth } from "@/lib/AuthContext";

const ADMIN_EMAIL = "reaganmungoma@gmail.com";

export default function PaperPdfButton({ label = "Question Paper PDF", paperId }) {
  const { user } = useAuth();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    setLoading(true);
    setUrl(null);
    setUploadSuccess(false);
    setUploadError(null);

    // Clear any stale cached URLs from old implementation
    try {
      const cacheKey = `p1_paper_url_${(paperId ?? "").replace(/\//g, "_")}`;
      localStorage.removeItem(cacheKey);
    } catch {}

    getPaperPdfUrl(paperId).then(u => {
      setUrl(u);
      setLoading(false);
    });
  }, [paperId]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      setUploadError("Please select a PDF file.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const { url: newUrl, error } = await uploadPaperPdf(file, paperId);
    setUploading(false);
    if (error) {
      setUploadError(`Upload failed: ${error}. Make sure the 'paper-assets' bucket exists in Supabase Storage and is set to public.`);
    } else {
      setUrl(newUrl);
      setUploadSuccess(true);
      setShowUpload(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading paper…</span>
      </div>
    );
  }

  if (!url) {
    if (!isAdmin) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 bg-secondary/50 text-xs text-muted-foreground/50">
          <FileText className="w-3.5 h-3.5" />
          <span>Paper PDF not available yet</span>
        </div>
      );
    }

    // Admin upload UI
    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowUpload(o => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-400 hover:brightness-110 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Question Paper PDF
        </button>

        {showUpload && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Upload PDF for {paperId}</p>
              <button onClick={() => setShowUpload(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The PDF will be uploaded to Supabase Storage and become available to all users on all devices.
              Make sure the <code className="font-mono bg-secondary px-1 rounded">paper-assets</code> bucket exists and is set to <strong>public</strong>.
            </p>
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold cursor-pointer transition-all ${
              uploading
                ? "border-border text-muted-foreground/50 cursor-not-allowed"
                : "border-primary/40 text-primary hover:border-primary hover:bg-primary/5"
            }`}>
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4" /> Choose PDF file</>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {uploadError && (
              <p className="text-[11px] text-red-400 leading-relaxed">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-[11px] text-green-400 font-semibold">✓ PDF uploaded successfully!</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // PDF is available — show open + download buttons
  return (
    <div className="flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/40 bg-primary/10 text-xs font-semibold text-primary hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <FileText className="w-3.5 h-3.5" />
        {label}
      </a>
      <a
        href={url}
        download
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:brightness-110 active:scale-[0.98] transition-all"
        title="Download PDF"
      >
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}