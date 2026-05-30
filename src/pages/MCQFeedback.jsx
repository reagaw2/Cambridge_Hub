import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MCQFeedback is no longer the primary feedback path — MCQSession now shows
// feedback inline. This page is kept only for backward compat.
export default function MCQFeedback() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // If we land here from the old flow, redirect back
  useEffect(() => {
    if (!state) { navigate(-1); }
  }, []);

  if (!state) return null;

  // Just redirect to the inline MCQ session
  navigate(-1);
  return null;
}