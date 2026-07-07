import { useEffect, useMemo, useRef, useState } from "react";
import type { DemandMode, Person } from "./types";
import { isWebhookConfigured } from "./services/submitDemand";
import { useSolicitantes } from "./hooks/useSolicitantes";
import { normalizeText } from "./utils/text";
import { AuroraBackground } from "./components/AuroraBackground";
import { RequesterSelect, OTHER_REQUESTER_ID } from "./components/RequesterSelect";
import { CopyPersonalLink } from "./components/CopyPersonalLink";
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

/** Parâmetros de link pessoal (?solicitanteId=... ou ?solicitante=...). */
function readUrlParams(): { solicitanteId: string; solicitanteName: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    solicitanteId: params.get("solicitanteId")?.trim() ?? "",
    solicitanteName: params.get("solicitante")?.trim() ?? "",
  };
}

const STEPS = [
  { number: "01", label: "Identifique-se" },
  { number: "02", label: "Escolha o formato" },
  { number: "03", label: "Envie a demanda" },
];

export default function App() {
  const { solicitantes, loading, error, reload } = useSolicitantes();
  const [selectedId, setSelectedId] = useState<string>(() =>
    readStorage(REQUESTER_ID_STORAGE_KEY),
  );
  const [otherName, setOtherName] = useState<string>(() =>
    readStorage(OTHER_NAME_STORAGE_KEY),
  );
  const [mode, setMode] = useState<DemandMode | null>(null);
  const [urlParams] = useState(readUrlParams);
  const urlAppliedRef = useRef(false);

  function handleSelect(id: string) {
    setSelectedId(id);
    writeStorage(REQUESTER_ID_STORAGE_KEY, id);
  }

  function handleOtherNameChange(name: string) {
    setOtherName(name);
    writeStorage(OTHER_NAME_STORAGE_KEY, name);
  }

  // Pré-seleção por link pessoal, aplicada uma vez quando a lista chega.
  // Prioridade: ?solicitanteId > ?solicitante (nome) > localStorage.
  //
  // Futuro (embed na monday): aqui também será o ponto para casar o
  // usuário logado da monday com um item do Mapa de Solicitantes.
  useEffect(() => {
    if (urlAppliedRef.current) return;
    if (loading) return;
    // Se a lista falhou, tenta resolver de novo após um reload bem-sucedido.
    if (error && solicitantes.length === 0) return;
    urlAppliedRef.current = true;

    const { solicitanteId, solicitanteName } = urlParams;
    if (!solicitanteId && !solicitanteName) return; // sem params → localStorage

    if (
      solicitanteId &&
      solicitantes.some((solicitante) => solicitante.id === solicitanteId)
    ) {
      handleSelect(solicitanteId);
      return;
    }

    if (solicitanteName) {
      const target = normalizeText(solicitanteName);
      const match = solicitantes.find(
        (solicitante) => normalizeText(solicitante.name) === target,
      );
      if (match) {
        handleSelect(match.id);
        return;
      }
      // Link pessoal de quem se identifica como "Outro".
      handleSelect(OTHER_REQUESTER_ID);
      handleOtherNameChange(solicitanteName);
      return;
    }

    // Parâmetro presente mas não encontrado: começa vazio, sem quebrar.
    setSelectedId("");
  }, [loading, error, solicitantes, urlParams]);

  // Se a pessoa salva não existe mais na lista, o campo volta para vazio.
  const effectiveSelectedId =
    selectedId === OTHER_REQUESTER_ID ||
    solicitantes.some((solicitante) => solicitante.id === selectedId)
      ? selectedId
      : "";

  const requester: Person | null = useMemo(() => {
    if (effectiveSelectedId === OTHER_REQUESTER_ID) {
      const name = otherName.trim();
      if (name === "") return null;
      return { id: OTHER_REQUESTER_ID, name, aliases: "", boardId: "" };
    }
    const solicitante = solicitantes.find(
      (candidate) => candidate.id === effectiveSelectedId,
    );
    if (!solicitante) return null;
    // O id do item do Mapa de Solicitantes é o requester_id enviado ao n8n.
    return { id: solicitante.id, name: solicitante.name, aliases: "", boardId: "" };
  }, [effectiveSelectedId, otherName, solicitantes]);

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
              solicitantes={solicitantes}
              loading={loading}
              error={error}
              selectedId={effectiveSelectedId}
              otherName={otherName}
              onSelect={handleSelect}
              onOtherNameChange={handleOtherNameChange}
              onReload={reload}
            />
            {requester && <CopyPersonalLink requester={requester} />}
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
