import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Welcome() {
  const [mode, setMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Real-Time Password Strength Assessment ---
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const strengthPoints = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

  let strengthLabel = "";
  let strengthColor = "bg-border";
  let strengthWidth = "w-0";

  if (password.length > 0) {
    if (strengthPoints <= 2) {
      strengthLabel = "Weak password";
      strengthColor = "bg-destructive";
      strengthWidth = "w-1/3";
    } else if (strengthPoints === 3) {
      strengthLabel = "Strong password";
      strengthColor = "bg-amber-500";
      strengthWidth = "w-2/3";
    } else if (strengthPoints === 4) {
      strengthLabel = "Secure password";
      strengthColor = "bg-emerald-500";
      strengthWidth = "w-full";
    }
  }

  const isMismatched = confirmPassword.length > 0 && password !== confirmPassword;

  // --- Helper Function to Validate Email Format Structure ---
  function isValidEmail(emailStr) {
    // This standard pattern checks for: characters + @ + domain name + extension (.com, .org, etc)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(emailStr);
  }

  // Handle Sign In Submit
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    // Validate email layout before hitting the backend
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address (e.g., user@domain.com).");
      return;
    }

    setLoading(true);

    const { error } = await base44.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  // Handle Sign Up Submit
  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");

    // 1. Validate email syntax format
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address structure (e.g., name@gmail.com).");
      return;
    }

    // 2. Validate password match
    if (password !== confirmPassword) {
      setErrorMsg("Passwords must match before registering.");
      return;
    }

    // 3. Validate password complexity rules
    if (strengthPoints < 4) {
      setErrorMsg("Please satisfy all rules to create a secure password.");
      return;
    }

    setLoading(true);

    const { error } = await base44.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      alert("Registration successful! Check your email for the activation link.");
      setMode("login");
      setConfirmPassword("");
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

        <div className="w-px h-8 bg-border/40" />

        {mode === "welcome" && (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => { setMode("signup"); setErrorMsg(""); }}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Get started
            </button>
            <button
              onClick={() => { setMode("login"); setErrorMsg(""); }}
              className="w-full bg-transparent border border-border text-foreground/70 font-medium text-sm py-4 rounded-xl hover:bg-secondary transition-all"
            >
              I already have an account
            </button>
          </div>
        )}

        {(mode === "login" || mode === "signup") && (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="w-full flex flex-col gap-4">
            
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-medium text-foreground capitalize">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === "login" ? "Enter your credentials to log in" : "Sign up below to access your quizzes"}
              </p>
            </div>
            
            {errorMsg && (
              <p className="text-xs text-destructive text-center bg-destructive/10 py-2.5 px-3 rounded-lg border border-destructive/20">
                {errorMsg}
              </p>
            )}

            <div className="space-y-3">
              {/* Email Input with HTML5 type validation */}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              
              {/* Main Password Input */}
              <input
                type="password"
                placeholder={mode === "login" ? "Password" : "Choose a secure password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />

              {/* Dynamic Strength Meter */}
              {mode === "signup" && password.length > 0 && (
                <div className="space-y-1.5 px-1 pb-1">
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300`} />
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground font-light">
                      Reqs: 6+ chars, A-Z, a-z, 0-9
                    </span>
                    <span className="font-medium capitalize" style={{ color: strengthPoints <= 2 ? '#ef4444' : strengthPoints === 3 ? '#f59e0b' : '#10b981' }}>
                      {strengthLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              {mode === "signup" && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-secondary/50 border rounded-xl text-sm focus:outline-none transition-all duration-200
                    ${isMismatched 
                      ? "border-destructive focus:border-destructive shadow-[0_0_10px_rgba(239,68,68,0.15)]" 
                      : "border-border focus:border-primary/50"
                    }`}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? "Processing..." : mode === "login" ? "Log In" : "Register Account"}
            </button>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 px-1">
              <button
                type="button"
                onClick={() => { setMode("welcome"); setPassword(""); setConfirmPassword(""); setErrorMsg(""); }}
                className="hover:text-foreground transition-colors"
              >
                ← Cancel
              </button>
              
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setPassword(""); setConfirmPassword(""); setErrorMsg(""); }}
                  className="text-primary hover:underline"
                >
                  Create an account instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setPassword(""); setConfirmPassword(""); setErrorMsg(""); }}
                  className="text-primary hover:underline"
                >
                  Sign in instead
                </button>
              )}
            </div>
          </form>
        )}

        <p className="text-xs text-amber-500/70 text-center leading-relaxed">
          Please use email and password to sign up or log in.<br />
          Google login is not available yet.
        </p>

      </div>
    </div>
  );
}