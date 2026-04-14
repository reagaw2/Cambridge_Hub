import { base44 } from "@/api/base44Client";

export default function Welcome() {
  function goLogin() {
    base44.auth.redirectToLogin(window.location.origin + "/");
  }

  function goSignUp() {
    base44.auth.redirectToLogin(window.location.origin + "/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-10">

        {/* Brand mark */}
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
        <div className="w-px h-12 bg-border/40" />

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={goSignUp}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Get started
          </button>
          <button
            onClick={goLogin}
            className="w-full bg-transparent border border-border text-foreground/70 font-medium text-sm py-4 rounded-xl hover:bg-secondary transition-all"
          >
            I already have an account
          </button>
        </div>

        {/* Google OAuth notice */}
        <p className="text-xs text-amber-500/70 text-center leading-relaxed">
          Please use email and password to sign up or log in.<br />
          Google login is not available yet.
        </p>

      </div>
    </div>
  );
}