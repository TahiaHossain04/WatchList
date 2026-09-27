import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { CandyButton } from "./CandyButton";

/**
 * A styled "are you sure?" pop-up (instead of the browser's plain confirm()).
 * Escape or clicking the backdrop cancels. Focus starts on Cancel (the safe choice).
 */
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
      // Keep Tab inside the dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled)");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-(--color-backdrop) p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}
        >
          <motion.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={message ? messageId : undefined}
            className="candy-panel w-full max-w-md p-7 text-center"
            initial={{ scale: 0.85, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <h2 id={titleId} className="font-title text-2xl font-bold break-words text-ink">
              {title}
            </h2>
            {message && (
              <p id={messageId} className="mt-2 text-ink-muted">
                {message}
              </p>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <CandyButton ref={cancelRef} variant="ghost" onClick={onCancel} disabled={busy}>
                Cancel
              </CandyButton>
              <CandyButton variant="danger" onClick={onConfirm} disabled={busy}>
                {busy ? "Deleting…" : confirmLabel}
              </CandyButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
