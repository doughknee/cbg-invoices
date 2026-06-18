/**
 * App-wide error handling.
 *
 * - `RouteErrorComponent` is wired into the router as `defaultErrorComponent`,
 *   so any error thrown while rendering a route shows a styled fallback (with
 *   a retry) in place of that route's content instead of a blank screen. The
 *   surrounding layout/nav stays intact for errors in a child route.
 * - `RootErrorBoundary` is a last-resort class boundary around the whole tree
 *   for the rare error the router can't catch (e.g. inside a provider).
 *
 * Note: this catches render/lifecycle crashes. React Query errors are still
 * surfaced inline by each query's consumer; we deliberately don't flip them to
 * throw so existing "not found" / empty states keep working.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";

export function AppErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const detail =
    error instanceof Error ? error.message : typeof error === "string" ? error : null;

  return (
    <div className="min-h-[60vh] px-6 py-16 flex flex-col items-center justify-center text-center">
      <span
        aria-hidden
        className="inline-flex items-center justify-center h-14 w-14 bg-amber/10 border border-amber/30 mb-4"
      >
        <ExclamationTriangleIcon className="h-7 w-7 text-amber" />
      </span>
      <p className="font-display text-xl text-navy">Something went wrong</p>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
        This screen hit an unexpected error. Try again, or reload if it keeps happening.
      </p>
      {detail && (
        <pre className="mt-4 max-w-lg w-full overflow-auto bg-graphite/5 p-3 text-left text-xs text-graphite whitespace-pre-wrap">
          {detail}
        </pre>
      )}
      <div className="mt-5 flex gap-3">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  );
}

/** Router-level fallback. TanStack passes `error` + `reset` (re-render retry). */
export function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
  return <AppErrorState error={error} onRetry={reset} />;
}

interface RootErrorBoundaryState {
  error: Error | null;
}

export class RootErrorBoundary extends Component<
  { children: ReactNode },
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Last-resort logging; the router handles the common in-app cases.
    console.error("Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <AppErrorState
          error={this.state.error}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
