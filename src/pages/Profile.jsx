import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, LogOut, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { resetData } from "@/lib/topicStore";
import { base44 } from "@/api/base44Client";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { avatarLetter } = useDisplayName();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [preferredName, setPreferredName] = useState(user?.preferred_name ?? "");
  const [nameSaved, setNameSaved] = useState(false);

  async function handleSavePreferredName() {
    const trimmed = preferredName.trim();
    localStorage.setItem(`cambridge_hub_preferred_name_${user?.id ?? "anon"}`, trimmed);
    await base44.auth.updateMe({ preferred_name: trimmed });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  const handleDeleteAccount = async () => {
    // Clear all data and log out
    await resetData();
    logout(true);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Profile</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col gap-6 p-4 pt-6">

          {/* User info */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">
                {avatarLetter}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.full_name ?? "Student"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email ?? ""}</p>
            </div>
          </div>

          {/* Preferred name */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preferred Name</p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              The name we use to address you. Leave empty to use your first name.
            </p>
            <div className="flex gap-2">
              <input
                value={preferredName}
                onChange={(e) => { setPreferredName(e.target.value.slice(0, 20)); setNameSaved(false); }}
                placeholder="What should we call you?"
                maxLength={20}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              <button
                onClick={handleSavePreferredName}
                className="px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                {nameSaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : "Save"}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => logout(true)}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:brightness-110 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Sign out</span>
          </button>

          {/* Danger zone */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400/70">Danger Zone</p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/15 transition-all w-full text-left"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">Delete account</span>
              </button>
            ) : (
              <div className="bg-red-500/8 border border-red-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-400">This cannot be undone</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">
                      Deleting your account will permanently erase all your progress data, streaks, review bank, and session history. Your account will be signed out immediately.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Type <span className="font-mono text-foreground">DELETE</span> to confirm
                  </p>
                  <input
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:brightness-110 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== "DELETE"}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}