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
      // Wait for content to fully render before restoring
      const restore = () => {
        if (keyRef.current !== key) return;
        window.scrollTo({ top: saved, behavior: "instant" });
      };
      // Try immediately, then again after a tick, then after 100ms
      restore();
      requestAnimationFrame(restore);
      const t = setTimeout(restore, 100);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.key, navType]);

  // Save scroll position on every scroll while on this page
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