/** Centered loading indicator — matches the EmptyState layout so panels don't
 *  jump between states. */
export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="px-6 py-14 md:py-20 flex flex-col items-center text-center">
      <span
        aria-hidden
        className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber border-r-transparent motion-reduce:animate-none"
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
