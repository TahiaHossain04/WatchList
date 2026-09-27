import { motion } from "framer-motion";
import { useId } from "react";

/**
 * A row of pill "chips" where exactly one is selected (like radio buttons).
 * Used for filters (type, collection) and in the entry form (status, type, collection).
 * The pink highlight slides between chips thanks to Framer Motion's `layoutId`.
 */

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  color?: string; // optional little color dot (e.g. collection color)
}

interface ChipGroupProps<T extends string> {
  label: string; // accessible name for the group
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  invalid?: boolean;
  describedBy?: string;
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "sm",
  invalid,
  describedBy,
}: ChipGroupProps<T>) {
  const groupId = useId(); // keeps each group's sliding highlight separate

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="flex flex-wrap gap-1.5"
      onKeyDown={(e) => {
        // Arrow keys move between chips, like native radio buttons.
        if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
        e.preventDefault();
        const i = options.findIndex((o) => o.value === value);
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
        const next = options[(i + step + options.length) % options.length];
        onChange(next.value);
        const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
        buttons[(i + step + options.length) % options.length]?.focus();
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`relative inline-flex items-center gap-1.5 rounded-full font-bold transition-colors ${
              size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-4 py-2 text-base"
            } ${selected ? "text-ink-dark" : "text-ink-muted hover:bg-panel-raised hover:text-ink"}`}
          >
            {selected && (
              <motion.span
                layoutId={`chip-${groupId}`}
                className="absolute inset-0 rounded-full bg-gum-light shadow-[inset_0_-3px_0_var(--color-pink-deep)]"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            {option.color && (
              <span
                aria-hidden="true"
                className="relative size-2.5 rounded-full ring-1 ring-black/10"
                style={{ background: option.color }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
