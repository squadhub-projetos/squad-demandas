import { useMemo, useState } from "react";
import type { DemandMode } from "./types";
import { isWebhookConfigured } from "./services/submitDemand";
import { useResponsaveis } from "./hooks/useResponsaveis";
import { AuroraBackground } from "./components/AuroraBackground";
import { RequesterSelect } from "./components/RequesterSelect";
import { ModePicker } from "./components/ModePicker";
import { TextDemandForm } from "./components/TextDemandForm";
import { AudioDemandForm } from "./components/AudioDemandForm";
import { LogoMark } from "./components/icons";

const REQUESTER_STORAGE_KEY = "squad-demandas:requester-id";

function loadStoredRequesterId(): string {
  try {
    return localStorage.getItem(REQUESTER_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

const STEPS = [
  { number: "01", label: "Identifique-se" },
  { number: "02", label: "Escolha o formato" },
  { number: "03", label: "Envie a demanda" },
];

export default function App() {
  const { people, loading, error, reload } = useResponsaveis();
  const [requesterId, setRequesterId] = useState<string>(loadStoredRequesterId);
  const [mode, setMode] = useState<DemandMode | null>(null);

  // Só considera selecionado se a pessoa ainda existir na lista atual.
  const requester = useMemo(
    () => people.find((person) => person.id === requesterId) ?? null,
    [people, requesterId],
  );

  function handleRequesterChange(id: string) {
    setRequesterId(id);
    try {
      localStorage.setItem(REQUESTER_STORAGE_KEY, id);
    } catch {
      // sem localStorage, segue sem persistir
    }
  }

  const currentStep = requester ? (mode ? 3 : 2) : 1;

  return (
    <div className="shell">
      <AuroraBackground />

      <main className="layout">
        <aside className="intro">
          <div className="brand">
            <LogoMark className="brand-mark" />
            <span>SquadHub</span>
          </div>

          <h1>
            Central de
            <br />
            Demandas
          </h1>
          <p className="lede">
            Uma única porta de entrada. Conte o que você precisa, por texto ou
            áudio, e a IA encaminha para a pessoa certa na monday.
          </p>

          <ol className="steps">
            {STEPS.map((step, index) => (
              <li
                key={step.number}
                className={
                  index + 1 === currentStep
                    ? "is-current"
                    : index + 1 < currentStep
                      ? "is-done"
                      : undefined
                }
                aria-current={index + 1 === currentStep ? "step" : undefined}
              >
                <span className="step-number">{step.number}</span>
                <span className="step-label">{step.label}</span>
              </li>
            ))}
          </ol>

          <footer className="intro-footer">SquadHub · uso interno</footer>
        </aside>

        <section className="panel">
          {!isWebhookConfigured && (
            <div className="config-notice" role="status">
              <span className="config-dot" aria-hidden="true" />
              Modo demonstração — defina <code>VITE_N8N_WEBHOOK_URL</code> para
              ativar o envio real.
            </div>
          )}

          <section className="panel-section">
            <RequesterSelect
              people={people}
              loading={loading}
              error={error}
              value={requester?.id ?? ""}
              onChange={handleRequesterChange}
              onReload={reload}
            />
          </section>

          {requester && (
            <section className="panel-section rise" key="mode-section">
              <div className="field-heading">
                <span className="field-label">Como prefere enviar?</span>
              </div>
              <ModePicker value={mode} onChange={setMode} />
            </section>
          )}

          {requester && mode === "text" && (
            <section className="panel-section" key={`text-${requester.id}`}>
              <TextDemandForm requester={requester} />
            </section>
          )}

          {requester && mode === "audio" && (
            <section className="panel-section" key={`audio-${requester.id}`}>
              <AudioDemandForm requester={requester} />
            </section>
          )}

          <footer className="panel-footer">SquadHub · uso interno</footer>
        </section>
      </main>
    </div>
  );
}
