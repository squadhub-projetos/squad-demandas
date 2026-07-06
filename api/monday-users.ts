// Vercel Function: GET /api/monday-users
// Lista os usuários ativos (não convidados) da conta monday.
// A MONDAY_API_KEY nunca sai do servidor.

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  json: (body: unknown) => void;
}

interface MondayUser {
  id: string;
  name: string;
  email: string;
}

interface RawUser {
  id: string | number;
  name?: string | null;
  email?: string | null;
  enabled?: boolean | null;
  is_guest?: boolean | null;
  is_pending?: boolean | null;
}

interface MondayUsersGraphQL {
  data?: { users?: RawUser[] | null };
  errors?: Array<{ message?: string }>;
}

const MONDAY_API_URL = "https://api.monday.com/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 200;
const MAX_PAGES = 10;

const QUERY_CURRENT = `
query GetActiveUsers($page: Int!) {
  users(
    limit: ${PAGE_SIZE}
    page: $page
    user_kind: { not_in: [GUEST] }
    status: [ACTIVE]
  ) {
    id
    name
    email
    kind
    status
  }
}
`;

const QUERY_LEGACY = `
query GetActiveUsersLegacy($page: Int!) {
  users(
    limit: ${PAGE_SIZE}
    page: $page
    kind: non_guests
    non_active: false
  ) {
    id
    name
    email
    enabled
    is_guest
    is_pending
  }
}
`;

// Cache em memória da instância. Mantemos os dados após expirar para
// servir como fallback caso a monday esteja fora do ar.
let cache: { users: MondayUser[]; expiresAt: number } | null = null;

async function queryPage(apiKey: string, query: string, page: number): Promise<RawUser[]> {
  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2026-07",
    },
    body: JSON.stringify({ query, variables: { page } }),
  });

  if (!response.ok) {
    throw new Error(`monday respondeu com status ${response.status}`);
  }

  const payload = (await response.json()) as MondayUsersGraphQL;

  if (payload.errors?.length) {
    throw new Error(`monday retornou erro: ${payload.errors[0]?.message ?? "desconhecido"}`);
  }

  return payload.data?.users ?? [];
}

async function paginateUsers(apiKey: string, query: string): Promise<RawUser[]> {
  const all: RawUser[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await queryPage(apiKey, query, page);
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return all;
}

function toUsers(raw: RawUser[]): MondayUser[] {
  return raw
    .map((user) => ({
      id: String(user.id),
      name: (user.name ?? "").trim(),
      email: (user.email ?? "").trim(),
    }))
    .filter((user) => user.name !== "")
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

async function fetchActiveUsers(apiKey: string): Promise<MondayUser[]> {
  try {
    // Query atual: filtros de user_kind/status direto na API.
    return toUsers(await paginateUsers(apiKey, QUERY_CURRENT));
  } catch {
    // Fallback legacy: filtra convidados/pendentes/desativados no código.
    const raw = await paginateUsers(apiKey, QUERY_LEGACY);
    const active = raw.filter(
      (user) =>
        user.enabled !== false && user.is_guest !== true && user.is_pending !== true,
    );
    return toUsers(active);
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.MONDAY_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "Configuração do servidor incompleta." });
    return;
  }

  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    res.status(200).json({ users: cache.users, cached: true });
    return;
  }

  try {
    const users = await fetchActiveUsers(apiKey);
    cache = { users, expiresAt: now + CACHE_TTL_MS };
    // Cache também na CDN da Vercel: instâncias de função não compartilham memória.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ users, cached: false });
  } catch (error) {
    // Loga apenas a mensagem — nunca a chave ou headers.
    console.error(
      "[api/monday-users]",
      error instanceof Error ? error.message : "erro desconhecido",
    );

    if (cache) {
      res.status(200).json({ users: cache.users, cached: true });
      return;
    }

    res.status(502).json({ error: "Não foi possível carregar os usuários." });
  }
}
