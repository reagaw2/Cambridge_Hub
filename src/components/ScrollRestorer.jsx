import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollCache = {};

export default function ScrollRestorer() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);

  useEffect(() => {
    const key = location.key;
    keyRef.current = key;

    if (navType === "POP") {
      const saved = scrollCache[key] ?? 0;
      if (saved === 0) return; // nothing to restore

      // Try restoring at multiple intervals to catch async/lazy content
      const attempts = [0, 50, 150, 350, 700];
      const timers = attempts.map(delay =>
        setTimeout(() => {
          if (keyRef.current !== key) return;
          window.scrollTo({ top: saved, behavior: "instant" });
        }, delay)
      );
      return () => timers.forEach(clearTimeout);
    } else {
      // PUSH or REPLACE — scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.key, navType]);

  // Save scroll position on every scroll event for this page
  useEffect(() => {
    const key = location.key;
    const onScroll = () => {
      scrollCache[key] = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.key]);

  return null;
}