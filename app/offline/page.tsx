export default function Offline() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-text-muted max-w-xs">
        This screen hasn&apos;t been saved on your phone yet. Connect to the internet once, and it will open without a signal after that.
      </p>
      <a href="/" className="rounded bg-primary px-5 py-3 font-bold text-on-primary">
        Try again
      </a>
    </div>
  );
}