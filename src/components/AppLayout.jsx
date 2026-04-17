import { useLocation, useNavigate, Outlet, useMatch } from "react-router-dom";
import { Home, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Routes where bottom nav should be hidden (question/answer flows)
const NO_NAV_PATTERNS = [
  /^\/$/,
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
  /^\/cs/,
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

// Tabs that preserve independent navigation state by staying mounted
const TAB_ROOTS = ["/", "/profile"];

function isTabRoot(pathname) {
  return TAB_ROOTS.includes(pathname);
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = shouldHideNav(location.pathname);

  // Active tab is "/physics" or "/profile"; anything else keeps previous tab highlighted
  const activeTab = location.pathname === "/profile" ? "/profile" : "/physics";

  return (
    <div
      className="flex flex-col min-h-screen bg-background"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: hideNav ? "env(safe-area-inset-bottom)" : "calc(env(safe-area-inset-bottom) + 64px)",
      }}
    >
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

      {!hideNav && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center px-4 z-50"
          style={{ height: "calc(env(safe-area-inset-bottom) + 56px)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Home tab — navigates to "/" but preserves scroll position via browser history */}
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px]"
          >
            <Home className={`w-5 h-5 ${activeTab === "/physics" ? "text-primary" : "text-muted-foreground/50"}`} />
            <span className={`text-[10px] font-medium ${activeTab === "/physics" ? "text-primary" : "text-muted-foreground/50"}`}>
              Home
            </span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px]"
            onClick={() => alert("History coming soon")}
          >
            <Clock className="w-5 h-5 text-muted-foreground/50" />
            <span className="text-[10px] font-medium text-muted-foreground/50">History</span>
          </button>

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