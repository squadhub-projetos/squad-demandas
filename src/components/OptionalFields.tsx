import { useId } from "react";
import { FileUpload } from "./FileUpload";

interface OptionalFieldsProps {
  deadline: string;
  details: string;
  attachment: File | null;
  detailsLabel?: string;
  onDeadlineChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onAttachmentChange: (file: File | null) => void;
}

export function OptionalFields({
  deadline,
  details,
  attachment,
  detailsLabel = "Detalhes",
  onDeadlineChange,
  onDetailsChange,
  onAttachmentChange,
}: OptionalFieldsProps) {
  const deadlineId = useId();
  const detailsId = useId();

  return (
    <div className="optional-block">
      <div className="optional-divider">
        <span>Opcional</span>
      </div>

      <div className="optional-grid">
        <div className="field">
          <label htmlFor={deadlineId}>Prazo</label>
          <input
            id={deadlineId}
            type="date"
            value={deadline}
            onChange={(event) => onDeadlineChange(event.target.value)}
          />
        </div>

        <div className="field">
          <span className="field-label">Anexo</span>
          <FileUpload file={attachment} onChange={onAttachmentChange} />
        </div>

        <div className="field optional-details">
          <label htmlFor={detailsId}>{detailsLabel}</label>
          <textarea
            id={detailsId}
            rows={2}
            placeholder="Contexto, links, referências…"
            value={details}
            onChange={(event) => onDetailsChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
