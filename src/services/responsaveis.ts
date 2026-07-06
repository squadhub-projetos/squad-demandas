import type { Person, ResponsaveisResponse } from "../types";

export async function fetchResponsaveis(): Promise<Person[]> {
  const response = await fetch("/api/responsaveis", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar responsáveis (status ${response.status}).`);
  }

  const data = (await response.json()) as ResponsaveisResponse;

  if (!Array.isArray(data.people)) {
    throw new Error("Resposta inesperada do servidor.");
  }

  return data.people;
}
