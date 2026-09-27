import type { FieldControlProps } from "./Field";

/**
 * 0–10 rating in half steps: a slider plus the big number.
 * An empty string means "not rated" (stored as NULL).
 */
interface RatingInputProps extends FieldControlProps {
  value: string;
  onChange: (value: string) => void;
}

export function RatingInput({ value, onChange, ...fieldProps }: RatingInputProps) {
  const rated = value !== "";
  const number = rated ? Number(value) : 0;

  return (
    <div className="flex items-center gap-4 rounded-[1.1rem] border-2 border-line bg-page px-4 py-2.5">
      <input
        {...fieldProps}
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={number}
        onChange={(e) => onChange(e.target.value)}
        aria-valuetext={rated ? `${number} out of 10` : "Not rated"}
        className="h-2 flex-1 cursor-pointer accent-(--color-pink-primary)"
        style={{ opacity: rated ? 1 : 0.5 }}
      />
      <span className="w-16 text-center font-title text-2xl font-bold text-gum-light" aria-hidden="true">
        {rated ? `★ ${number % 1 ? number.toFixed(1) : number}` : "—"}
      </span>
      {rated && (
        <button type="button" onClick={() => onChange("")} className="rounded-full px-2 text-sm font-bold text-ink-muted hover:text-ink">
          Clear
        </button>
      )}
    </div>
  );
}
