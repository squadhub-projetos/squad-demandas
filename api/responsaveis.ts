// Vercel Function: GET /api/responsaveis
// Lista as pessoas ativas do board "Mapa de Responsáveis" da monday.
// A MONDAY_API_KEY nunca sai do servidor.

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  json: (body: unknown) => void;
}

interface Person {
  id: string;
  name: string;
  aliases: string;
  boardId: string;
}

interface MondayColumnValue {
  id: string;
  text: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
}

interface MondayResponse {
  data?: {
    boards?: Array<{
      items_page?: { items?: MondayItem[] };
    }>;
  };
  errors?: Array<{ message?: string }>;
}

const MONDAY_API_URL = "https://api.monday.com/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;

const COLUMN_ALIASES = "text_mm4xsr5x";
const COLUMN_BOARD_ID = "text_mm4xcvf2";
const COLUMN_STATUS = "status";

// Query mínima para evitar complexity error da monday:
// só id, name e as três colunas necessárias.
const QUERY = `
query GetResponsaveisLite($boardId: [ID!]) {
  boards(ids: $boardId) {
    items_page(limit: 100) {
      items {
        id
        name
        column_values(ids: ["${COLUMN_ALIASES}", "${COLUMN_BOARD_ID}", "${COLUMN_STATUS}"]) {
          id
          text
        }
      }
    }
  }
}
`;

// Cache em memória da instância. Mantemos os dados após expirar para
// servir como fallback caso a monday esteja fora do ar.
let cache: { people: Person[]; expiresAt: number } | null = null;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

const ACTIVE_VALUES = new Set(["ativo", "ativa", "sim", "yes", "active", "true"]);

function columnText(item: MondayItem, columnId: string): string {
  const column = item.column_values.find((value) => value.id === columnId);
  return column?.text?.trim() ?? "";
}

function isActive(item: MondayItem): boolean {
  return ACTIVE_VALUES.has(normalize(columnText(item, COLUMN_STATUS)));
}

function toPerson(item: MondayItem): Person {
  return {
    id: item.id,
    name: item.name,
    aliases: columnText(item, COLUMN_ALIASES),
    boardId: columnText(item, COLUMN_BOARD_ID),
  };
}

async function fetchPeopleFromMonday(apiKey: string, boardId: string): Promise<Person[]> {
  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query: QUERY, variables: { boardId: [boardId] } }),
  });

  if (!response.ok) {
    throw new Error(`monday respondeu com status ${response.status}`);
  }

  const payload = (await response.json()) as MondayResponse;

  if (payload.errors?.length) {
    throw new Error(`monday retornou erro: ${payload.errors[0]?.message ?? "desconhecido"}`);
  }

  const items = payload.data?.boards?.[0]?.items_page?.items ?? [];
  return items
    .filter(isActive)
    .map(toPerson)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.MONDAY_RESPONSAVEIS_BOARD_ID;

  if (!apiKey || !boardId) {
    res.status(500).json({ error: "Configuração do servidor incompleta." });
    return;
  }

  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    res.status(200).json({ people: cache.people, cached: true });
    return;
  }

  try {
    const people = await fetchPeopleFromMonday(apiKey, boardId);
    cache = { people, expiresAt: now + CACHE_TTL_MS };
    // Cache também na CDN da Vercel: instâncias de função não compartilham memória.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ people, cached: false });
  } catch (error) {
    // Loga apenas a mensagem — nunca a chave ou headers.
    console.error(
      "[api/responsaveis]",
      error instanceof Error ? error.message : "erro desconhecido",
    );

    if (cache) {
      res.status(200).json({ people: cache.people, cached: true });
      return;
    }

    res.status(502).json({ error: "Não foi possível carregar os responsáveis." });
  }
}
