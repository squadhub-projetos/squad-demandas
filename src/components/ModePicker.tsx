import type { DemandMode } from "../types";
import { IconMic, IconText } from "./icons";

interface ModePickerProps {
  value: DemandMode | null;
  onChange: (mode: DemandMode) => void;
}

const MODES: Array<{
  id: DemandMode;
  title: string;
  hint: string;
  icon: typeof IconText;
}> = [
  {
    id: "text",
    title: "Texto",
    hint: "Escreva a solicitação em poucas linhas",
    icon: IconText,
  },
  {
    id: "audio",
    title: "Áudio",
    hint: "Grave explicando com a sua voz",
    icon: IconMic,
  },
];

export function ModePicker({ value, onChange }: ModePickerProps) {
  return (
    <div className="mode-picker" role="group" aria-label="Formato da demanda">
      {MODES.map(({ id, title, hint, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`mode-button${value === id ? " is-active" : ""}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          <span className="mode-icon">
            <Icon width={20} height={20} />
          </span>
          <span className="mode-copy">
            <span className="mode-title">{title}</span>
            <span className="mode-hint">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
