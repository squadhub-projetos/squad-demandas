import { useCallback, useEffect, useRef, useState } from "react";
import type { MondayUser } from "../types";
import { fetchMondayUsers } from "../services/mondayUsers";

export interface MondayUsersState {
  users: MondayUser[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useMondayUsers(): MondayUsersState {
  const [users, setUsers] = useState<MondayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMondayUsers();
      if (seq !== requestSeq.current) return;
      setUsers(list);
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

  return { users, loading, error, reload };
}
