import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Bubble } from "./Bubble";

/**
 * Friendly full-width message used for empty lists, errors and "not found".
 *   <StateMessage title="Nothing here yet." message="…" action={<button…/>} />
 */
interface StateMessageProps {
  title: string;
  message?: string;
  action?: ReactNode;
  tone?: "empty" | "error";
}

export function StateMessage({ title, message, action, tone = "empty" }: StateMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center"
      role={tone === "error" ? "alert" : undefined}
    >
      {/* A tiny cluster of bubbles as the "illustration". */}
      <div className="relative mb-6 h-20 w-28 text-[3rem]" aria-hidden="true">
        <Bubble tone={tone === "error" ? "lavender" : "pink"} size="1.1em" style={{ left: "18%", top: "10%" }} />
        <Bubble tone="cream" size="0.45em" style={{ right: "8%", top: "0%" }} delay={0.1} />
        <Bubble tone="lavender" size="0.3em" style={{ right: "20%", bottom: "0%" }} delay={0.2} />
      </div>
      <h2 className="font-title text-3xl font-bold text-ink">{title}</h2>
      {message && <p className="mt-2 text-lg text-ink-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
