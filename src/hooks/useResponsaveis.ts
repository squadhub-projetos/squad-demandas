import { useCallback, useEffect, useRef, useState } from "react";
import type { Person } from "../types";
import { fetchResponsaveis } from "../services/responsaveis";

export interface ResponsaveisState {
  people: Person[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useResponsaveis(): ResponsaveisState {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchResponsaveis();
      if (seq !== requestSeq.current) return;
      setPeople(list);
      setLoading(false);
    } catch {
      if (seq !== requestSeq.current) return;
      setError("Não foi possível carregar a lista de pessoas.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return { people, loading, error, reload };
}
