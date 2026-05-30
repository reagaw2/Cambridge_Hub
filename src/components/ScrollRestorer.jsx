import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollCache = {};

export default function ScrollRestorer() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") {
      const saved = scrollCache[location.key] ?? 0;
      requestAnimationFrame(() => window.scrollTo(0, saved));
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      scrollCache[location.key] = window.scrollY;
    };
  }, [location.key, navType]);

  return null;
}