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

export interface SubmitResult {
  /** true quando o webhook não está configurado e o envio foi apenas simulado */
  demo: boolean;
}
