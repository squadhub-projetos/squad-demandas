/**
 * Fundo atmosférico fixo: blobs de gradiente em movimento lento,
 * granulado sutil e vinheta. Puramente decorativo.
 */
export function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob aurora-a" />
      <div className="aurora-blob aurora-b" />
      <div className="aurora-blob aurora-c" />
      <div className="aurora-grain" />
      <div className="aurora-vignette" />
    </div>
  );
}
