import { useCallback, useEffect, useRef, useState } from "react";
import type { Solicitante } from "../types";
import { fetchSolicitantes } from "../services/solicitantes";

export interface SolicitantesState {
  solicitantes: Solicitante[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSolicitantes(): SolicitantesState {
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSolicitantes();
      if (seq !== requestSeq.current) return;
      setSolicitantes(list);
      setLoading(false);
    } catch {
      if (seq !== requestSeq.current) return;
      setError("Não foi possível carregar a lista de solicitantes.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return { solicitantes, loading, error, reload };
}
