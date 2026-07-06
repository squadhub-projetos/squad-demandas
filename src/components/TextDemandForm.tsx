import { useState, type FormEvent } from "react";
import type { Person, SubmitResult, SubmitStatus } from "../types";
import { submitDemand } from "../services/submitDemand";
import { OptionalFields } from "./OptionalFields";
import { ErrorPanel, ProcessingPanel, SuccessPanel } from "./Feedback";
import { IconSend } from "./icons";

interface TextDemandFormProps {
  requester: Person;
}

export function TextDemandForm({ requester }: TextDemandFormProps) {
  const [demandText, setDemandText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);

  // Bloqueia o envio apenas quando texto E detalhes estão vazios.
  const canSubmit = demandText.trim() !== "" || details.trim() !== "";

  function clearFields() {
    setDemandText("");
    setDeadline("");
    setDetails("");
    setAttachment(null);
  }

  async function performSubmit() {
    // A tela "enviada para análise" aparece imediatamente;
    // o fetch segue aguardando o n8n em segundo plano.
    setStatus("sending");
    try {
      const submitResult = await submitDemand({
        requester,
        mode: "text",
        demandText,
        deadline,
        details,
        attachment,
        audio: null,
      });
      setResult(submitResult);
      clearFields();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || status === "sending") return;
    void performSubmit();
  }

  if (status === "sending") {
    return <ProcessingPanel />;
  }

  if (status === "success" && result) {
    return (
      <SuccessPanel
        result={result}
        onReset={() => {
          setStatus("idle");
          setResult(null);
        }}
      />
    );
  }

  if (status === "error") {
    return (
      <ErrorPanel
        onRetry={() => void performSubmit()}
        onEdit={() => setStatus("idle")}
      />
    );
  }

  return (
    <form className="demand-form rise" onSubmit={handleSubmit}>
      <div className="prompt-field">
        <label htmlFor="demand-text">O que você precisa?</label>
        <textarea
          id="demand-text"
          rows={4}
          placeholder="Descreva a demanda com suas palavras. A IA cuida do resto."
          value={demandText}
          onChange={(event) => setDemandText(event.target.value)}
        />
      </div>

      <OptionalFields
        deadline={deadline}
        details={details}
        attachment={attachment}
        onDeadlineChange={setDeadline}
        onDetailsChange={setDetails}
        onAttachmentChange={setAttachment}
      />

      <div className="form-actions">
        {!canSubmit && <span className="form-hint">Descreva a demanda para enviar</span>}
        <button
          type="submit"
          className="primary-button"
          disabled={!canSubmit}
        >
          <IconSend width={16} height={16} />
          Enviar demanda
        </button>
      </div>
    </form>
  );
}
