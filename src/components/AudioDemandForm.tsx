import { useState, type FormEvent } from "react";
import type { Person, SubmitResult, SubmitStatus } from "../types";
import { submitDemand } from "../services/submitDemand";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { OptionalFields } from "./OptionalFields";
import { InlineError, SuccessPanel } from "./Feedback";
import { IconMic, IconSend, IconStop } from "./icons";

interface AudioDemandFormProps {
  requester: Person;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AudioDemandForm({ requester }: AudioDemandFormProps) {
  const recorder = useAudioRecorder();
  const [deadline, setDeadline] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    recorder.reset();
    setDeadline("");
    setDetails("");
    setAttachment(null);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recorder.audioBlob || status === "sending") return;
    setStatus("sending");
    setErrorMessage(null);
    try {
      const submitResult = await submitDemand({
        requester,
        mode: "audio",
        demandText: "",
        deadline,
        details,
        attachment,
        audio: recorder.audioBlob,
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
      <div className={`recorder${recorder.isRecording ? " is-recording" : ""}`}>
        {recorder.isRecording ? (
          <>
            <div className="recorder-live">
              <span className="wave" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="recorder-timer">{formatElapsed(recorder.elapsedSeconds)}</span>
            </div>
            <p className="recorder-caption">Gravando — fale com naturalidade</p>
            <button
              type="button"
              className="record-toggle stop"
              onClick={recorder.stop}
              aria-label="Parar gravação"
            >
              <IconStop width={22} height={22} />
            </button>
          </>
        ) : recorder.audioUrl ? (
          <>
            <audio controls src={recorder.audioUrl} className="audio-preview" />
            <button type="button" className="text-button" onClick={recorder.reset}>
              Descartar e gravar novamente
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="record-toggle"
              onClick={() => void recorder.start()}
              aria-label="Iniciar gravação"
            >
              <IconMic width={24} height={24} />
            </button>
            <p className="recorder-caption">Toque para gravar sua demanda</p>
          </>
        )}
        {recorder.error && <InlineError>{recorder.error}</InlineError>}
      </div>

      <OptionalFields
        deadline={deadline}
        details={details}
        attachment={attachment}
        detailsLabel="Detalhes adicionais"
        onDeadlineChange={setDeadline}
        onDetailsChange={setDetails}
        onAttachmentChange={setAttachment}
      />

      {status === "error" && errorMessage && <InlineError>{errorMessage}</InlineError>}

      <div className="form-actions">
        {!recorder.audioBlob && !recorder.isRecording && (
          <span className="form-hint">Grave um áudio para enviar</span>
        )}
        <button
          type="submit"
          className="primary-button"
          disabled={!recorder.audioBlob || status === "sending"}
        >
          {status === "sending" ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            <>
              <IconSend width={16} height={16} />
              Enviar áudio
            </>
          )}
        </button>
      </div>
    </form>
  );
}
