import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Welcome() {
  // Mode can be: 'welcome', 'login', or 'signup'
  const [mode, setMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle User Login
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await base44.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
    // If successful, Supabase auth state changes automatically,
    // and App.jsx will automatically route the student inward!
  }

  // Handle User Signup
  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await base44.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      alert("Signup successful! Check your email for the confirmation link.");
      setMode("login");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-8">
        
        {/* Brand Mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary font-serif">C</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-semibold text-foreground tracking-tight">
              Cambridge Hub
            </h1>
            <p className="text-base text-muted-foreground font-light tracking-wide">
              Write the way Cambridge wants.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border/40" />

        {/* Dynamic Form Interface based on State */}
        {mode === "welcome" && (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => setMode("signup")}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Get started
            </button>
            <button
              onClick={() => setMode("login")}
              className="w-full bg-transparent border border-border text-foreground/70 font-medium text-sm py-4 rounded-xl hover:bg-secondary transition-all"
            >
              I already have an account
            </button>
          </div>
        )}

        {(mode === "login" || mode === "signup") && (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="w-full flex flex-col gap-4">
            <h2 className="text-lg font-medium text-foreground text-center capitalize">
              {mode} to your account
            </h2>
            
            {errorMsg && (
              <p className="text-xs text-destructive text-center bg-destructive/10 py-2 rounded-lg border border-destructive/20">
                {errorMsg}
              </p>
            )}

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {loading ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("welcome"); setErrorMsg(""); }}
              className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors pt-2"
            >
              ← Back
            </button>
          </form>
        )}

        {/* Google OAuth Notice */}
        <p className="text-xs text-amber-500/70 text-center leading-relaxed">
          Please use email and password to sign up or log in.<br />
          Google login is not available yet.
        </p>

      </div>
    </div>
  );
}