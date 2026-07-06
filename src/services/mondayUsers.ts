import type { MondayUser, MondayUsersResponse } from "../types";

export async function fetchMondayUsers(): Promise<MondayUser[]> {
  const response = await fetch("/api/monday-users", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar usuários (status ${response.status}).`);
  }

  const data = (await response.json()) as MondayUsersResponse;

  if (!Array.isArray(data.users)) {
    throw new Error("Resposta inesperada do servidor.");
  }

  return data.users;
}
