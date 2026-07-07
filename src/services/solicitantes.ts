import type { Solicitante, SolicitantesResponse } from "../types";

export async function fetchSolicitantes(): Promise<Solicitante[]> {
  const response = await fetch("/api/solicitantes", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar solicitantes (status ${response.status}).`);
  }

  const data = (await response.json()) as SolicitantesResponse;

  if (!Array.isArray(data.solicitantes)) {
    throw new Error("Resposta inesperada do servidor.");
  }

  return data.solicitantes;
}
