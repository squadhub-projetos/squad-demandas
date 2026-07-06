import { useId } from "react";
import type { MondayUser } from "../types";
import { IconAlert, IconChevronDown, IconRefresh } from "./icons";

export const OTHER_REQUESTER_ID = "other";

interface RequesterSelectProps {
  users: MondayUser[];
  loading: boolean;
  error: string | null;
  /** "" | id de usuário monday | "other" */
  selectedId: string;
  otherName: string;
  onSelect: (id: string) => void;
  onOtherNameChange: (name: string) => void;
  onReload: () => void;
}

export function RequesterSelect({
  users,
  loading,
  error,
  selectedId,
  otherName,
  onSelect,
  onOtherNameChange,
  onReload,
}: RequesterSelectProps) {
  const selectId = useId();
  const otherId = useId();

  const isOther = selectedId === OTHER_REQUESTER_ID;

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
      ) : (
        <>
          <div className="select-shell">
            <select
              id={selectId}
              value={selectedId}
              onChange={(event) => onSelect(event.target.value)}
            >
              <option value="" disabled>
                Selecione seu nome
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
              <option value={OTHER_REQUESTER_ID}>Outro</option>
            </select>
            <IconChevronDown className="select-chevron" width={16} height={16} />
          </div>

          {isOther && (
            <div className="other-name rise">
              <label htmlFor={otherId}>Digite seu nome</label>
              <input
                id={otherId}
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={otherName}
                onChange={(event) => onOtherNameChange(event.target.value)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
