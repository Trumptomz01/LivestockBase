export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div
        className="w-9 h-9 rounded-full border-4 border-border border-t-primary animate-spin"
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
