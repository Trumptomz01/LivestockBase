// Renders the raw SVG path strings stored in lib/store.tsx's module
// definitions, so the same icon markup is reused everywhere (module
// tiles, module pills, avatars) without duplicating JSX per module.
export function IconPaths({ paths, className }: { paths: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
