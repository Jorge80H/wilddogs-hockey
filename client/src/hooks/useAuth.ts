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
 * - isPlayer: Whether user has player role
 * - isGuardian: Whether user has guardian role
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
  role: 'admin' | 'coach' | 'player' | 'guardian';
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
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
            $: {
              where: { id: instantUser.id },
            },
          },
        }
      : null
  );

  // Extract the user from the query result
  const user = data?.users?.[0] as User | undefined;

  // Combine loading states
  const isLoading = authLoading || dataLoading;

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!instantUser && !!user,
    isAdmin: user?.role === "admin",
    isCoach: user?.role === "coach",
    isPlayer: user?.role === "player",
    isGuardian: user?.role === "guardian",
  };
}

// Export types for use in other files
export type { User, InstantUser };
