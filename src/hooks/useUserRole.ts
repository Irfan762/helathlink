import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/hooks/useAuth";

interface UseUserRoleResult {
  role: UserRole | null;
  loading: boolean;
}

/**
 * Lightweight wrapper around useAuth that exposes only role + loading.
 * useAuth already handles supabase.auth.getSession and role fetching.
 */
export const useUserRole = (): UseUserRoleResult => {
  const { userRole, loading } = useAuth();

  return {
    role: userRole,
    loading,
  };
};
