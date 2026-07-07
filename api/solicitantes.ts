// Vercel Function: GET /api/solicitantes
// Lista os itens do board "Mapa de Solicitantes" da monday.
// O id do item é o solicitanteId usado pelo app; o name é o requester_name.
// A MONDAY_API_KEY nunca sai do servidor.
//
// Futuro (embed na monday): quando o app rodar embedado, será possível
// identificar o usuário logado via SDK da monday e tentar casar com um
// item deste board. Por ora, a fonte oficial do solicitante é este board.

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  json: (body: unknown) => void;
}

interface Solicitante {
  id: string;
  name: string;
}

interface RawItem {
  id: string | number;
  name?: string | null;
}

interface ItemsPage {
  cursor?: string | null;
  items?: RawItem[] | null;
}

interface GraphQLResponse {
  data?: {
    boards?: Array<{ items_page?: ItemsPage | null }> | null;
    next_items_page?: ItemsPage | null;
  };
  errors?: Array<{ message?: string }>;
}

const MONDAY_API_URL = "https://api.monday.com/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 500;
const MAX_PAGES = 10;

// Query mínima: somente id e name dos itens, nada de colunas/settings/updates.
const QUERY_FIRST = `
query GetSolicitantes($boardId: [ID!]) {
  boards(ids: $boardId) {
    id
    name
    items_page(limit: ${PAGE_SIZE}) {
      cursor
      items {
        id
        name
      }
    }
  }
}
`;

const QUERY_NEXT = `
query GetSolicitantesNext($cursor: String!) {
  next_items_page(limit: ${PAGE_SIZE}, cursor: $cursor) {
    cursor
    items {
      id
      name
    }
  }
}
`;

// Cache em memória da instância. Mantemos os dados após expirar para
// servir como fallback caso a monday esteja fora do ar.
let cache: { solicitantes: Solicitante[]; expiresAt: number } | null = null;

async function callMonday(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<NonNullable<GraphQLResponse["data"]>> {
  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2026-07",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`monday respondeu com status ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse;

  if (payload.errors?.length) {
    throw new Error(`monday retornou erro: ${payload.errors[0]?.message ?? "desconhecido"}`);
  }

  return payload.data ?? {};
}

async function fetchSolicitantes(apiKey: string, boardId: string): Promise<Solicitante[]> {
  const first = await callMonday(apiKey, QUERY_FIRST, { boardId: [boardId] });
  const firstPage = first.boards?.[0]?.items_page;
  const raw: RawItem[] = [...(firstPage?.items ?? [])];

  // Paginação por cursor, com teto de páginas para evitar loop.
  let cursor = firstPage?.cursor ?? null;
  for (let page = 0; page < MAX_PAGES && cursor; page++) {
    const next = await callMonday(apiKey, QUERY_NEXT, { cursor });
    const nextPage = next.next_items_page;
    raw.push(...(nextPage?.items ?? []));
    cursor = nextPage?.cursor ?? null;
  }

  return raw
    .map((item) => ({ id: String(item.id), name: (item.name ?? "").trim() }))
    .filter((solicitante) => solicitante.name !== "")
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.MONDAY_SOLICITANTES_BOARD_ID;

  if (!apiKey || !boardId) {
    res.status(500).json({ error: "Configuração do servidor incompleta." });
    return;
  }

  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    res.status(200).json({ solicitantes: cache.solicitantes, cached: true });
    return;
  }

  try {
    const solicitantes = await fetchSolicitantes(apiKey, boardId);
    cache = { solicitantes, expiresAt: now + CACHE_TTL_MS };
    // Cache também na CDN da Vercel: instâncias de função não compartilham memória.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ solicitantes, cached: false });
  } catch (error) {
    // Loga apenas a mensagem — nunca a chave ou headers.
    console.error(
      "[api/solicitantes]",
      error instanceof Error ? error.message : "erro desconhecido",
    );

    if (cache) {
      res.status(200).json({ solicitantes: cache.solicitantes, cached: true });
      return;
    }

    res.status(502).json({ error: "Não foi possível carregar os solicitantes." });
  }
}
