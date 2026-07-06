import type { ReactNode } from "react";
import type { SubmitResult } from "../types";
import { IconAlert, IconCheck } from "./icons";

/**
 * Etapa 1 do envio: aparece imediatamente após o clique,
 * enquanto o webhook do n8n processa em segundo plano.
 */
export function ProcessingPanel() {
  return (
    <div className="status-panel rise" role="status" aria-live="polite">
      <span className="status-ring ring-neutral">
        <span className="orbit" aria-hidden="true" />
      </span>
      <h2>Solicitação enviada para análise</h2>
      <p>
        Recebemos sua solicitação. Você já pode fechar esta janela; se
        permanecer aqui, mostraremos a confirmação final assim que o
        processamento terminar.
      </p>
    </div>
  );
}

interface SuccessPanelProps {
  result: SubmitResult;
  onReset: () => void;
}

/** Etapa 2: o n8n confirmou com ok=true. */
export function SuccessPanel({ result, onReset }: SuccessPanelProps) {
  const { demo, item } = result;

  return (
    <div className="status-panel rise" role="status">
      <span className="status-ring ring-success">
        <IconCheck width={26} height={26} />
      </span>
      <h2>Solicitação aprovada com sucesso</h2>
      <p>
        {demo
          ? "Ambiente de demonstração — nada foi enviado. Configure o webhook para ativar o envio real."
          : "A demanda foi registrada e encaminhada para o fluxo responsável."}
      </p>

      <div className="status-actions">
        {item?.url && (
          <a
            className="ghost-button"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir na monday
          </a>
        )}
        <button type="button" className="text-button" onClick={onReset}>
          Enviar outra demanda
        </button>
      </div>
    </div>
  );
}

interface ErrorPanelProps {
  onRetry: () => void;
  onEdit: () => void;
}

/** O n8n não confirmou (erro de rede, HTTP ou ok=false). */
export function ErrorPanel({ onRetry, onEdit }: ErrorPanelProps) {
  return (
    <div className="status-panel rise" role="alert">
      <span className="status-ring ring-error">
        <IconAlert width={24} height={24} />
      </span>
      <h2>Não foi possível concluir o processamento</h2>
      <p>
        Sua solicitação não foi confirmada. Tente novamente ou avise o time
        responsável.
      </p>

      <div className="status-actions">
        <button type="button" className="ghost-button" onClick={onRetry}>
          Tentar novamente
        </button>
        <button type="button" className="text-button" onClick={onEdit}>
          Editar demanda
        </button>
      </div>
    </div>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <p className="inline-error" role="alert">
      <IconAlert width={15} height={15} />
      <span>{children}</span>
    </p>
  );
}
