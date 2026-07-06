import type { DemandPayload, N8nResponse, SubmitResult } from "../types";

const webhookUrl = ((import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined) ?? "").trim();

export const isWebhookConfigured = webhookUrl !== "";

/** Valor de `mode` no contrato com o n8n: "texto" | "audio". */
function wireMode(mode: DemandPayload["mode"]): "texto" | "audio" {
  return mode === "text" ? "texto" : "audio";
}

export async function submitDemand(payload: DemandPayload): Promise<SubmitResult> {
  if (!isWebhookConfigured) {
    // Ambiente sem webhook: simula o envio para permitir testar a interface.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { demo: true };
  }

  const formData = new FormData();
  formData.append("requester_id", payload.requester.id);
  formData.append("requester_name", payload.requester.name);
  formData.append("requester_aliases", payload.requester.aliases);
  formData.append("requester_board_id", payload.requester.boardId);
  formData.append("mode", wireMode(payload.mode));
  formData.append("demand_text", payload.demandText.trim());
  formData.append("deadline", payload.deadline); // input type="date" já produz YYYY-MM-DD
  formData.append("details", payload.details.trim());
  formData.append("source", "squad-demandas-pwa");
  formData.append("client_timestamp", new Date().toISOString());

  if (payload.mode === "audio" && payload.audio) {
    const extension = payload.audio.type.includes("mp4") ? "m4a" : "webm";
    formData.append("audio_file", payload.audio, `demanda-audio.${extension}`);
  }
  if (payload.attachment) {
    formData.append("attachment_file", payload.attachment, payload.attachment.name);
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`O servidor respondeu com status ${response.status}.`);
  }

  let data: N8nResponse;
  try {
    data = (await response.json()) as N8nResponse;
  } catch {
    throw new Error("O servidor respondeu em um formato inesperado.");
  }

  if (data.ok !== true) {
    throw new Error(data.message || "O n8n não confirmou o registro da demanda.");
  }

  return {
    demo: false,
    message: data.message,
    item: data.item,
    ai: data.ai,
  };
}
