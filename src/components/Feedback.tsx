import type { ReactNode } from "react";
import type { SubmitResult } from "../types";
import { IconAlert, IconCheck } from "./icons";

interface SuccessPanelProps {
  result: SubmitResult;
  onReset: () => void;
}

function formatDeadline(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function SuccessPanel({ result, onReset }: SuccessPanelProps) {
  const { demo, message, item, ai } = result;

  const rows = [
    { label: "Item", value: item?.name },
    { label: "Responsável", value: item?.responsible },
    { label: "Prioridade", value: ai?.priority },
    { label: "Prazo", value: formatDeadline(ai?.deadline) },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="success-panel rise" role="status">
      <span className="success-ring">
        <IconCheck width={26} height={26} />
      </span>
      <h2>Demanda registrada</h2>
      <p>
        {demo
          ? "Ambiente de demonstração — nada foi enviado. Configure o webhook para ativar o envio real."
          : (message ?? "Recebemos sua solicitação e o item foi criado na monday.")}
      </p>

      {rows.length > 0 && (
        <dl className="success-details">
          {rows.map((row) => (
            <div className="detail-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="success-actions">
        {item?.url && (
          <a
            className="primary-button"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir na monday
          </a>
        )}
        <button type="button" className="ghost-button" onClick={onReset}>
          Enviar outra demanda
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
