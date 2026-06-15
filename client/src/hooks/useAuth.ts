import { db } from "@/lib/instant";

/**
 * useAuth Hook - InstantDB Authentication
 *
 * This hook provides authentication state and user information using InstantDB.
 * It replaces the previous React Query-based auth that called /api/auth/user.
 *
 * Returns:
 * - user: The full user object with role and profile info
 * - isLoading: Whether auth state is being determined
 * - isAuthenticated: Whether user is logged in
 * - isAdmin: Whether user has admin role
 * - isCoach: Whether user has coach role
 * - isGuardian: Whether user has guardian (titular) role
 * - players: Player profiles linked to this user (for guardians)
 * - coachProfile: Coach profile linked to this user (for coaches)
 */

// Type for the InstantDB user object
interface InstantUser {
  id: string;
  email: string;
}

// Type for our users entity in InstantDB
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  role: "admin" | "coach" | "guardian";
  status: "active" | "inactive";
  players?: any[];
  coachProfile?: any[];
  createdAt: number;
  updatedAt: number;
}

export function useAuth() {
  // Get auth state from InstantDB
  const { user: instantUser, isLoading: authLoading } = db.useAuth();

  // Query the users entity to get full user profile with role
  const { data, isLoading: dataLoading } = db.useQuery(
    instantUser
      ? {
          users: {
            $: { where: { id: instantUser.id } },
            players: {},
            coachProfile: { category: {} },
          },
        }
      : null
  );

  // Extract the user from the query result
  const user = data?.users?.[0] as User | undefined;

  // Combine loading states
  // Only check dataLoading if we have an instantUser, otherwise ignore it
  const isLoading = authLoading || (!!instantUser && dataLoading);

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!instantUser && !!user,
    isAdmin: user?.role === "admin",
    isCoach: user?.role === "coach",
    isGuardian: user?.role === "guardian",
    players: (user?.players || []) as any[],
    coachProfile: (user?.coachProfile?.[0] || null) as any,
  };
}

// Export types for use in other files
export type { User, InstantUser };
