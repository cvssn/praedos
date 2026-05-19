import { useQuery } from '@tanstack/react-query';
import type { Worldstate } from '@shared/types';

export function useWorldstate(refetchMs = 60_000) {
  return useQuery<Worldstate>({
    queryKey: ['worldstate'],
    queryFn: () => window.praedos.worldstate.get(),
    refetchInterval: refetchMs,
    staleTime: 20_000,
  });
}
