import { useMemo, useState } from "react";
import type { DemandMode, Person } from "./types";
import { isWebhookConfigured } from "./services/submitDemand";
import { useMondayUsers } from "./hooks/useMondayUsers";
import { AuroraBackground } from "./components/AuroraBackground";
import { RequesterSelect, OTHER_REQUESTER_ID } from "./components/RequesterSelect";
import { ModePicker } from "./components/ModePicker";
import { TextDemandForm } from "./components/TextDemandForm";
import { AudioDemandForm } from "./components/AudioDemandForm";

const REQUESTER_ID_STORAGE_KEY = "squad-demandas:requester-id";
const OTHER_NAME_STORAGE_KEY = "squad-demandas:requester-other-name";

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // sem localStorage, segue sem persistir
  }
}

const STEPS = [
  { number: "01", label: "Identifique-se" },
  { number: "02", label: "Escolha o formato" },
  { number: "03", label: "Envie a demanda" },
];

export default function App() {
  const { users, loading, error, reload } = useMondayUsers();
  const [selectedId, setSelectedId] = useState<string>(() =>
    readStorage(REQUESTER_ID_STORAGE_KEY),
  );
  const [otherName, setOtherName] = useState<string>(() =>
    readStorage(OTHER_NAME_STORAGE_KEY),
  );
  const [mode, setMode] = useState<DemandMode | null>(null);

  // Se a pessoa salva não existe mais na lista, o select volta para vazio.
  const effectiveSelectedId =
    selectedId === OTHER_REQUESTER_ID || users.some((user) => user.id === selectedId)
      ? selectedId
      : "";

  const requester: Person | null = useMemo(() => {
    if (effectiveSelectedId === OTHER_REQUESTER_ID) {
      const name = otherName.trim();
      if (name === "") return null;
      return { id: OTHER_REQUESTER_ID, name, aliases: "", boardId: "" };
    }
    const user = users.find((candidate) => candidate.id === effectiveSelectedId);
    if (!user) return null;
    return { id: user.id, name: user.name, aliases: "", boardId: "" };
  }, [effectiveSelectedId, otherName, users]);

  function handleSelect(id: string) {
    setSelectedId(id);
    writeStorage(REQUESTER_ID_STORAGE_KEY, id);
  }

  function handleOtherNameChange(name: string) {
    setOtherName(name);
    writeStorage(OTHER_NAME_STORAGE_KEY, name);
  }

  const currentStep = requester ? (mode ? 3 : 2) : 1;

  return (
    <div className="shell">
      <AuroraBackground />

      <main className="layout">
        <aside className="intro">
          <img
            src="/logo-squadhub.svg"
            alt="SquadHub"
            className="brand-logo"
            draggable={false}
          />

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
              users={users}
              loading={loading}
              error={error}
              selectedId={effectiveSelectedId}
              otherName={otherName}
              onSelect={handleSelect}
              onOtherNameChange={handleOtherNameChange}
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
