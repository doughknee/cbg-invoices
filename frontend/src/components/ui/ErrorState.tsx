import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

/** Centered error panel — mirrors EmptyState with a red-tinted icon and an
 *  optional retry. Use for failed queries inside a panel/card. */
export function ErrorState({
  title = "Couldn't load this",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="px-6 py-14 md:py-20 flex flex-col items-center text-center">
      <span
        aria-hidden
        className="mb-4 inline-flex h-14 w-14 items-center justify-center border border-red-200 bg-red-50"
      >
        <ExclamationTriangleIcon className="h-7 w-7 text-red-600" />
      </span>
      <p className="font-display text-xl text-navy">{title}</p>
      {message && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
      )}
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
