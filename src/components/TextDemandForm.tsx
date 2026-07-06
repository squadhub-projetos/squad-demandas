import { useState, type FormEvent } from "react";
import type { Person, SubmitResult, SubmitStatus } from "../types";
import { submitDemand } from "../services/submitDemand";
import { OptionalFields } from "./OptionalFields";
import { InlineError, SuccessPanel } from "./Feedback";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bloqueia o envio apenas quando texto E detalhes estão vazios.
  const canSubmit = demandText.trim() !== "" || details.trim() !== "";

  function reset() {
    setDemandText("");
    setDeadline("");
    setDetails("");
    setAttachment(null);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || status === "sending") return;
    setStatus("sending");
    setErrorMessage(null);
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
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível enviar agora. Tente de novo em instantes.",
      );
      setStatus("error");
    }
  }

  if (status === "success" && result) {
    return <SuccessPanel result={result} onReset={reset} />;
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

      {status === "error" && errorMessage && <InlineError>{errorMessage}</InlineError>}

      <div className="form-actions">
        {!canSubmit && <span className="form-hint">Descreva a demanda para enviar</span>}
        <button
          type="submit"
          className="primary-button"
          disabled={!canSubmit || status === "sending"}
        >
          {status === "sending" ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            <>
              <IconSend width={16} height={16} />
              Enviar demanda
            </>
          )}
        </button>
      </div>
    </form>
  );
}
