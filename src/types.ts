export type DemandMode = "text" | "audio";

export type SubmitStatus = "idle" | "sending" | "success" | "error";

export interface Person {
  id: string;
  name: string;
  aliases: string;
  boardId: string;
}

export interface ResponsaveisResponse {
  people: Person[];
  cached: boolean;
}

export interface DemandPayload {
  requester: Person;
  mode: DemandMode;
  demandText: string;
  deadline: string;
  details: string;
  attachment: File | null;
  audio: Blob | null;
}

/** Item criado na monday, conforme retornado pelo fluxo do n8n. */
export interface N8nItem {
  id?: string;
  name?: string;
  url?: string;
  boardId?: string;
  boardName?: string;
  group?: string;
  responsible?: string;
}

/** Interpretação da IA sobre a demanda, retornada pelo n8n. */
export interface N8nAi {
  priority?: string;
  status?: string;
  deadline?: string;
  confidence?: number;
  needsReview?: boolean;
}

export interface N8nResponse {
  ok: boolean;
  message?: string;
  item?: N8nItem;
  ai?: N8nAi;
  attachmentUploaded?: boolean;
}

export interface SubmitResult {
  /** true quando o webhook não está configurado e o envio foi apenas simulado */
  demo: boolean;
  message?: string;
  item?: N8nItem;
  ai?: N8nAi;
}
