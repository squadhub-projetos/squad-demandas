import { useState, type FormEvent } from "react";
import type { Person, SubmitResult, SubmitStatus } from "../types";
import { submitDemand } from "../services/submitDemand";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { OptionalFields } from "./OptionalFields";
import { ErrorPanel, InlineError, ProcessingPanel, SuccessPanel } from "./Feedback";
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

  function clearFields() {
    recorder.reset();
    setDeadline("");
    setDetails("");
    setAttachment(null);
  }

  async function performSubmit() {
    if (!recorder.audioBlob) return;
    // A tela "enviada para análise" aparece imediatamente;
    // o fetch segue aguardando o n8n em segundo plano.
    setStatus("sending");
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
      clearFields();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recorder.audioBlob || status === "sending") return;
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

      <div className="form-actions">
        {!recorder.audioBlob && !recorder.isRecording && (
          <span className="form-hint">Grave um áudio para enviar</span>
        )}
        <button
          type="submit"
          className="primary-button"
          disabled={!recorder.audioBlob}
        >
          <IconSend width={16} height={16} />
          Enviar áudio
        </button>
      </div>
    </form>
  );
}
