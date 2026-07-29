import { db } from "@/lib/instant";

/**
 * useFamily — devuelve la cuenta-titular actual y sus jugadores.
 * Los jugadores incluyen sus documentos para el banner de estado.
 */
export function useFamily() {
  const { user: authUser, isLoading: authLoading } = db.useAuth();

  const { data, isLoading: dataLoading } = db.useQuery(
    authUser
      ? {
          users: {
            $: { where: { id: authUser.id } },
            players: { documents: {} },
          },
        }
      : null
  );

  const titular = (data?.users?.[0] || null) as any;
  const players = (titular?.players || []) as any[];

  return {
    authUser,
    titular,
    players,
    isLoading: authLoading || (!!authUser && dataLoading),
    // El titular necesita completar contacto si le falta teléfono o nombre.
    needsOnboarding: !!titular && (!titular.phone || !titular.firstName),
  };
}
