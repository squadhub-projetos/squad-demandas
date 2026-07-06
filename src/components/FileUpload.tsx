import { useId, useRef } from "react";
import { IconClip, IconX } from "./icons";

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ file, onChange }: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  if (file) {
    return (
      <div className="file-chip">
        <IconClip width={15} height={15} />
        <span className="file-chip-name" title={file.name}>
          {file.name}
        </span>
        <span className="file-chip-size">{formatBytes(file.size)}</span>
        <button
          type="button"
          className="icon-button"
          onClick={clear}
          aria-label="Remover anexo"
        >
          <IconX width={14} height={14} />
        </button>
      </div>
    );
  }

  return (
    <label className="file-trigger" htmlFor={inputId}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <IconClip width={15} height={15} />
      <span>Anexar arquivo</span>
    </label>
  );
}
