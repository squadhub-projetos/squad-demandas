import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Solicitante } from "../types";
import { normalizeText } from "../utils/text";
import { IconAlert, IconChevronDown, IconRefresh } from "./icons";

export const OTHER_REQUESTER_ID = "other";

interface ComboOption {
  id: string;
  label: string;
  isOther?: boolean;
}

interface RequesterSelectProps {
  solicitantes: Solicitante[];
  loading: boolean;
  error: string | null;
  /** "" | id de item do Mapa de Solicitantes | "other" */
  selectedId: string;
  otherName: string;
  onSelect: (id: string) => void;
  onOtherNameChange: (name: string) => void;
  onReload: () => void;
}

/**
 * Combobox pesquisável: digite para filtrar, setas para navegar,
 * Enter seleciona, Escape fecha. "Outro" é sempre a última opção.
 */
export function RequesterSelect({
  solicitantes,
  loading,
  error,
  selectedId,
  otherName,
  onSelect,
  onOtherNameChange,
  onReload,
}: RequesterSelectProps) {
  const inputId = useId();
  const listboxId = useId();
  const otherFieldId = useId();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isOther = selectedId === OTHER_REQUESTER_ID;
  const selectedLabel = isOther
    ? "Outro"
    : (solicitantes.find((solicitante) => solicitante.id === selectedId)?.name ?? "");

  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    if (needle === "") return solicitantes;
    return solicitantes.filter((solicitante) =>
      normalizeText(solicitante.name).includes(needle),
    );
  }, [solicitantes, query]);

  const options: ComboOption[] = useMemo(
    () => [
      ...filtered.map((solicitante) => ({
        id: solicitante.id,
        label: solicitante.name,
      })),
      { id: OTHER_REQUESTER_ID, label: "Outro", isOther: true },
    ],
    [filtered],
  );

  useEffect(() => {
    if (highlight > options.length - 1) {
      setHighlight(Math.max(options.length - 1, 0));
    }
  }, [options.length, highlight]);

  // Clique/toque fora fecha a lista.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  // Mantém a opção destacada visível ao navegar por teclado.
  useEffect(() => {
    if (!open) return;
    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${highlight}"]`,
    );
    element?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function openList() {
    if (open) return;
    setOpen(true);
    setQuery("");
    const index = isOther
      ? solicitantes.length
      : solicitantes.findIndex((solicitante) => solicitante.id === selectedId);
    setHighlight(index >= 0 ? index : 0);
  }

  function choose(option: ComboOption) {
    onSelect(option.id);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setHighlight((current) => Math.min(current + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      if (open) {
        event.preventDefault();
        const option = options[highlight];
        if (option) choose(option);
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
    } else if (event.key === "Tab") {
      close();
    }
  }

  return (
    <div className="requester">
      <div className="field-heading">
        <label htmlFor={inputId}>Quem está solicitando</label>
        <button
          type="button"
          className="icon-button"
          onClick={onReload}
          disabled={loading}
          title="Recarregar lista"
          aria-label="Recarregar lista de solicitantes"
        >
          <IconRefresh className={loading ? "spin" : undefined} width={15} height={15} />
        </button>
      </div>

      {loading ? (
        <div className="select-skeleton" role="status" aria-label="Carregando solicitantes">
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
          <div className="combobox" ref={rootRef}>
            <input
              id={inputId}
              className="combobox-input"
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={open ? `${listboxId}-opt-${highlight}` : undefined}
              placeholder={selectedLabel || "Selecione ou digite para buscar"}
              value={open ? query : selectedLabel}
              onChange={(event) => {
                if (!open) setOpen(true);
                setQuery(event.target.value);
                setHighlight(0);
              }}
              onFocus={openList}
              onClick={openList}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="combobox-toggle"
              tabIndex={-1}
              aria-label={open ? "Fechar lista" : "Abrir lista"}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => (open ? close() : openList())}
            >
              <IconChevronDown
                width={16}
                height={16}
                className={open ? "flip" : undefined}
              />
            </button>

            {open && (
              <ul className="combobox-panel" role="listbox" id={listboxId} ref={listRef}>
                {filtered.length === 0 && (
                  <li className="combobox-empty">Nenhum solicitante encontrado</li>
                )}
                {options.map((option, index) => (
                  <li
                    key={option.id}
                    id={`${listboxId}-opt-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.id === selectedId}
                    className={[
                      "combobox-option",
                      index === highlight ? "is-highlighted" : "",
                      option.isOther ? "is-other" : "",
                      option.id === selectedId ? "is-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setHighlight(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isOther && (
            <div className="other-name rise">
              <label htmlFor={otherFieldId}>Digite seu nome</label>
              <input
                id={otherFieldId}
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
