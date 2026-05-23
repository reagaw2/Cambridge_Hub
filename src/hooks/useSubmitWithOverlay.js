import { useState } from "react";

export function useSubmitWithOverlay() {
  const [submitting, setSubmitting] = useState(false);

  async function run(asyncFn) {
    setSubmitting(true);
    try {
      await asyncFn();
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, run };
}