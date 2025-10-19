import { db } from '@/lib/instant';

/**
 * Hook para manejar autenticación con InstantDB
 *
 * Uso:
 * const { user, isLoading, signInWithEmail, signOut } = useInstantAuth();
 */
export function useInstantAuth() {
  const { user, isLoading, error } = db.useAuth();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await db.auth.signInWithPassword({ email, password });
    } catch (err) {
      console.error('Error signing in:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await db.auth.signUpWithPassword({ email, password });
    } catch (err) {
      console.error('Error signing up:', err);
      throw err;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      await db.auth.sendMagicCode({ email });
    } catch (err) {
      console.error('Error sending magic link:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await db.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  return {
    user,
    isLoading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
  };
}
