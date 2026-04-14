import { useAuth } from "@/lib/AuthContext";

/**
 * Returns the student's display name using priority:
 * 1. preferred_name from DB user profile
 * 2. cambridge_hub_preferred_name from localStorage
 * 3. First name from full_name
 */
export function useDisplayName() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "";
  const localName = localStorage.getItem("cambridge_hub_preferred_name") || "";
  const displayName = user?.preferred_name?.trim() || localName || firstName || "Student";
  const avatarLetter = displayName[0].toUpperCase();
  return { displayName, avatarLetter };
}