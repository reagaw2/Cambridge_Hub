import { useState } from "react";
import { supabaseClient } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Onboarding() {
  const { user } = useAuth();
  const [preferredName, setPreferredName] = useState("");

  const firstName = user?.email?.split("@")[0] ?? "you";
  const displayPreview = preferredName.trim() || firstName;

  async function handleContinue() {
    const name = preferredName.trim();
    const uid = user?.id ?? "anon";

    // Step 1 — instant localStorage write (scoped per user)
    localStorage.setItem(`cambridge_hub_preferred_name_${uid}`, name);
    localStorage.setItem(`cambridge_hub_onboarding_completed_${uid}`, "true");

    // Step 2 — save to Supabase user_metadata so it syncs cross-device
    try {
      await supabaseClient.auth.updateUser({
        data: { preferred_name: name, onboarding_completed: true },
      });
    } catch (e) {
      console.warn("[Onboarding] Could not sync to Supabase:", e);
    }

    // Step 3 — hard redirect so App.jsx re-evaluates localStorage
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[360px] flex flex-col gap-10">

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-semibold text-foreground leading-snug">
            Welcome to Cambridge Hub.
          </h1>
          <p className="text-base text-muted-foreground font-light">
            One quick thing before we start.
          </p>
        </div>

        {/* Input section */}
        <div className="flex flex-col gap-4">
          {/* Live preview */}
          <p
            className="text-lg font-medium transition-all duration-300"
            style={{ color: preferredName.trim() ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", opacity: 0.9 }}
          >
            We will call you <span className="text-primary">{displayPreview}</span>.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What should we call you?
            </label>
            <input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value.slice(0, 20))}
              placeholder="Your preferred name"
              maxLength={20}
              autoFocus
              className="bg-transparent border-b border-border text-foreground text-lg py-2 placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-muted-foreground/40">
              Optional — leave empty to use your first name
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Let's go →
        </button>

      </div>
    </div>
  );
}