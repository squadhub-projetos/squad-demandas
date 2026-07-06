import { useState, type FormEvent } from "react";
import type { Person, SubmitStatus } from "../types";
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
  const [wasDemo, setWasDemo] = useState(false);

  function reset() {
    recorder.reset();
    setDeadline("");
    setDetails("");
    setAttachment(null);
    setStatus("idle");
    setWasDemo(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recorder.audioBlob || status === "sending") return;
    setStatus("sending");
    try {
      const result = await submitDemand({
        requester,
        mode: "audio",
        demandText: "",
        deadline,
        details,
        attachment,
        audio: recorder.audioBlob,
      });
      setWasDemo(result.demo);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <SuccessPanel demo={wasDemo} onReset={reset} />;
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

      {status === "error" && (
        <InlineError>
          Não foi possível enviar agora. Verifique sua conexão e tente de novo.
        </InlineError>
      )}

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
