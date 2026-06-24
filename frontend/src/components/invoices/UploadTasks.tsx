/**
 * Upload presentation pieces.
 *
 * Upload is a secondary action on the queue, so there's no permanent
 * dropzone taking up the top of the page. Instead:
 *   - `UploadDropOverlay` appears only while a file is dragged over the queue.
 *   - `UploadTaskCard` renders progress inline, above the list, while a file
 *     is uploading / extracting, then auto-clears.
 *
 * The owning component holds the upload queue state (`useUploadQueue`) and
 * the hidden file input; these are dumb, presentational.
 */
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";
import { extractionMessageAt, type UploadStage, type UploadTask } from "@/lib/upload";

/** Full-bleed overlay shown while a PDF is dragged over the queue. */
export function UploadDropOverlay({
  onDrop,
  onLeave,
}: {
  onDrop: (files: File[]) => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(Array.from(e.dataTransfer.files));
        onLeave();
      }}
      className="absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-amber bg-stone/85 backdrop-blur-sm"
    >
      <div className="text-center pointer-events-none">
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-amber" aria-hidden />
        <p className="mt-3 font-display text-2xl text-navy">Drop to upload</p>
        <p className="mt-1 text-xs text-slate-500">PDF invoices only</p>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Progress card
// ──────────────────────────────────────────────────────────────────────────

export function UploadTaskCard({
  task,
  onDismiss,
}: {
  task: UploadTask;
  onDismiss: () => void;
}) {
  const { stage } = task;
  const file = (stage as Exclude<UploadStage, { kind: "idle" }>).file;
  const label = file?.name ?? "PDF";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn(
        "bg-white border-l-2 relative overflow-hidden",
        stage.kind === "error"
          ? "border-red-700"
          : stage.kind === "done"
            ? "border-green-600"
            : "border-amber",
      )}
    >
      <div className="p-4 flex items-start gap-3">
        <StageIcon stage={stage} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-graphite truncate">{label}</div>
              <StageCaption stage={stage} />
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="flex-shrink-0 p-0.5 text-slate-400 hover:text-graphite"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <StageBar stage={stage} />
          <StageAction stage={stage} onDismiss={onDismiss} />
        </div>
      </div>
    </motion.div>
  );
}

function StageIcon({ stage }: { stage: UploadStage }) {
  const iconClass = "h-5 w-5 flex-shrink-0 mt-0.5";
  if (stage.kind === "error") {
    return <ExclamationTriangleIcon className={cn(iconClass, "text-red-700")} />;
  }
  if (stage.kind === "done") {
    return <CheckCircleIcon className={cn(iconClass, "text-green-600")} />;
  }
  // Spinner for uploading/processing/extracting
  return (
    <span
      aria-hidden
      className={cn(
        iconClass,
        "inline-block rounded-full border-2 border-navy border-r-transparent animate-spin",
      )}
    />
  );
}

function StageCaption({ stage }: { stage: UploadStage }) {
  let text = "";
  switch (stage.kind) {
    case "uploading":
      text = `Uploading… ${stage.percent}%`;
      break;
    case "processing":
      text = "Saved. Queuing extraction…";
      break;
    case "extracting":
      text = extractionMessageAt(stage.elapsedSeconds);
      break;
    case "done":
      text = "Ready for review.";
      break;
    case "error":
      text = stage.message;
      break;
    default:
      return null;
  }
  return (
    <div
      className={cn(
        "text-xs mt-0.5 truncate",
        stage.kind === "error" ? "text-red-700" : "text-slate-500",
      )}
    >
      {text}
    </div>
  );
}

function StageBar({ stage }: { stage: UploadStage }) {
  if (stage.kind === "uploading") {
    return (
      <div className="mt-2 h-1 bg-stone/80 overflow-hidden">
        <motion.div
          className="h-full bg-amber"
          initial={false}
          animate={{ width: `${stage.percent}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    );
  }
  if (stage.kind === "processing" || stage.kind === "extracting") {
    return (
      <div className="mt-2 h-1 bg-stone/80 overflow-hidden">
        {/* Indeterminate shimmer */}
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  return null;
}

function StageAction({
  stage,
  onDismiss,
}: {
  stage: UploadStage;
  onDismiss: () => void;
}) {
  if (stage.kind === "done") {
    return (
      <div className="mt-2">
        <Link
          to="/invoices/$id"
          params={{ id: stage.invoice.id }}
          className="text-xs font-semibold text-navy hover:text-amber"
        >
          Review →
        </Link>
      </div>
    );
  }
  if (stage.kind === "error") {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-slate-600 hover:text-graphite"
        >
          Dismiss
        </button>
      </div>
    );
  }
  return null;
}
