import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Home, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollRestorer from "./ScrollRestorer";
import WhiteNoisePlayer from "./WhiteNoisePlayer";
import PomodoroTimer from "./PomodoroTimer";

const NO_NAV_PATTERNS = [
  /\/question$/,
  /\/similar-question$/,
  /\/familiarity-check$/,
  /^\/feedback$/,
  /^\/reflection$/,
  /^\/review$/,
  /^\/review-bank$/,
  /^\/guess-review-bank$/,
  /^\/review-affirmation$/,
  /^\/mcq$/,
  /^\/mcq-feedback$/,
  /\/q\d/,
  /^\/ai-tutors\/.+/,
];

function shouldHideNav(pathname) {
  return NO_NAV_PATTERNS.some((p) => p.test(pathname));
}

const pageVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

const pageTransition = { duration: 0.22, ease: "easeInOut" };

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = shouldHideNav(location.pathname);

  const activeTab =
    location.pathname === "/profile" ? "/profile" : "/home";

  return (
    <div
      className="flex flex-col min-h-screen bg-[#0d0d1a]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: hideNav ? "env(safe-area-inset-bottom)" : "calc(env(safe-area-inset-bottom) + 64px)",
      }}
    >
      {/* Scroll restoration — inside Router context */}
      <ScrollRestorer />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="flex-1"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {/* Floating study tools — always visible, above nav */}
      <div
        className="fixed z-30 flex flex-col items-center gap-2"
        style={{
          bottom: hideNav ? "calc(env(safe-area-inset-bottom) + 16px)" : "calc(env(safe-area-inset-bottom) + 72px)",
          right: "12px",
        }}
      >
        <PomodoroTimer />
        <WhiteNoisePlayer />
      </div>

      {!hideNav && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-[#0d0d1a]/95 backdrop-blur border-t border-white/5 flex justify-around items-center px-4 z-50"
          style={{ height: "calc(env(safe-area-inset-bottom) + 56px)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {location.pathname !== "/" && (
            <button
              onClick={() => navigate("/")}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px]"
            >
              <Home className={`w-5 h-5 ${activeTab === "/home" ? "text-primary" : "text-muted-foreground/50"}`} />
              <span className={`text-[10px] font-medium ${activeTab === "/home" ? "text-primary" : "text-muted-foreground/50"}`}>
                Home
              </span>
            </button>
          )}

          <div className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] opacity-35 cursor-not-allowed select-none">
            <div className="relative">
              <svg className="w-5 h-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.9 2.5 2.5 0 0 1-1-3.95 2.5 2.5 0 0 1 1.5-4.59A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.9 2.5 2.5 0 0 0 1-3.95 2.5 2.5 0 0 0-1.5-4.59A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
              <span className="absolute -top-1 -right-2 text-[8px] font-bold text-white/40 leading-none">🔒</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/50">AI Tutors</span>
          </div>

          <button
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px]"
            onClick={() => navigate("/profile")}
          >
            <User className={`w-5 h-5 ${activeTab === "/profile" ? "text-primary" : "text-muted-foreground/50"}`} />
            <span className={`text-[10px] font-medium ${activeTab === "/profile" ? "text-primary" : "text-muted-foreground/50"}`}>
              Profile
            </span>
          </button>
        </div>
      )}
    </div>
  );
}