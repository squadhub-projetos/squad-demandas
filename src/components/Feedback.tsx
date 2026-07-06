import type { ReactNode } from "react";
import { IconAlert, IconCheck } from "./icons";

interface SuccessPanelProps {
  demo: boolean;
  onReset: () => void;
}

export function SuccessPanel({ demo, onReset }: SuccessPanelProps) {
  return (
    <div className="success-panel rise" role="status">
      <span className="success-ring">
        <IconCheck width={26} height={26} />
      </span>
      <h2>Demanda enviada</h2>
      <p>
        {demo
          ? "Ambiente de demonstração — nada foi enviado. Configure o webhook para ativar o envio real."
          : "Recebemos sua solicitação. A IA vai interpretar a demanda e criar o item no board certo da monday."}
      </p>
      <button type="button" className="ghost-button" onClick={onReset}>
        Enviar outra demanda
      </button>
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
