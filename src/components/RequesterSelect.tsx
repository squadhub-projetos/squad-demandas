import { useId } from "react";
import type { Person } from "../types";
import { IconAlert, IconChevronDown, IconRefresh } from "./icons";

interface RequesterSelectProps {
  people: Person[];
  loading: boolean;
  error: string | null;
  value: string;
  onChange: (id: string) => void;
  onReload: () => void;
}

export function RequesterSelect({
  people,
  loading,
  error,
  value,
  onChange,
  onReload,
}: RequesterSelectProps) {
  const selectId = useId();

  return (
    <div className="requester">
      <div className="field-heading">
        <label htmlFor={selectId}>Quem está solicitando</label>
        <button
          type="button"
          className="icon-button"
          onClick={onReload}
          disabled={loading}
          title="Recarregar lista"
          aria-label="Recarregar lista de pessoas"
        >
          <IconRefresh className={loading ? "spin" : undefined} width={15} height={15} />
        </button>
      </div>

      {loading ? (
        <div className="select-skeleton" role="status" aria-label="Carregando pessoas">
          <span className="skeleton-bar" />
        </div>
      ) : error ? (
        <div className="load-error" role="alert">
          <IconAlert width={16} height={16} />
          <span>{error}</span>
          <button type="button" className="text-button" onClick={onReload}>
            Tentar novamente
          </button>
        </div>
      ) : people.length === 0 ? (
        <div className="load-error" role="status">
          <IconAlert width={16} height={16} />
          <span>Nenhuma pessoa ativa encontrada.</span>
          <button type="button" className="text-button" onClick={onReload}>
            Recarregar
          </button>
        </div>
      ) : (
        <div className="select-shell">
          <select
            id={selectId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="" disabled>
              Selecione seu nome
            </option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <IconChevronDown className="select-chevron" width={16} height={16} />
        </div>
      )}
    </div>
  );
}
