import { useAuth } from "@/lib/AuthContext";

/**
 * Returns the student's display name using priority:
 * 1. preferred_name from Supabase user_metadata (cross-device)
 * 2. cambridge_hub_preferred_name from localStorage (local fallback)
 * 3. First part of email before @
 */
export function useDisplayName() {
  const { user } = useAuth();
  const emailFirst = user?.email?.split("@")[0] ?? "";
  const localName = localStorage.getItem(`cambridge_hub_preferred_name_${user?.id ?? "anon"}`) || "";

  // user_metadata.preferred_name is the Supabase-synced source of truth
  const displayName = user?.preferred_name?.trim() || localName || emailFirst || "Student";
  const avatarLetter = (displayName[0] ?? "S").toUpperCase();
  return { displayName, avatarLetter };
}