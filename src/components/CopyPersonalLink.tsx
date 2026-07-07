import { useEffect, useRef, useState } from "react";
import type { Person } from "../types";
import { OTHER_REQUESTER_ID } from "./RequesterSelect";
import { IconCheck, IconCopy } from "./icons";

interface CopyPersonalLinkProps {
  requester: Person;
}

/**
 * Link pessoal para atalho no celular: aberto com esse link,
 * o app já pré-seleciona o solicitante (ver resolução de URL no App).
 */
function buildPersonalLink(requester: Person): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  if (requester.id === OTHER_REQUESTER_ID) {
    return `${base}?solicitante=${encodeURIComponent(requester.name)}`;
  }
  return `${base}?solicitanteId=${encodeURIComponent(requester.id)}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para contextos sem clipboard API.
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

export function CopyPersonalLink({ requester }: CopyPersonalLinkProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const success = await copyToClipboard(buildPersonalLink(requester));
    if (!success) return;
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="copy-link-row">
      <button
        type="button"
        className={`copy-link${copied ? " is-copied" : ""}`}
        onClick={() => void handleCopy()}
        aria-live="polite"
      >
        {copied ? (
          <IconCheck width={14} height={14} />
        ) : (
          <IconCopy width={14} height={14} />
        )}
        {copied ? "Link copiado" : "Copiar link pessoal"}
      </button>
    </div>
  );
}
