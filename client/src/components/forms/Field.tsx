import { useId, type ReactNode } from "react";

/**
 * Label + input + hint + error message, wired together for screen readers.
 * The input is passed as a function so it can receive the right id/aria props:
 *
 *   <Field label="Director" error={errors.director}>
 *     {(props) => <input {...props} className="field-input" />}
 *   </Field>
 */

export interface FieldControlProps {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}

export function Field({ label, required, hint, error, className = "", children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-bold text-ink">
        {label}
        {required && (
          <span className="ml-1 text-gum-light" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-bold text-gum-light" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** A titled group of fields inside the form. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="candy-panel p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-title text-2xl font-bold text-ink" aria-hidden="true">
        {title}
      </h2>
      {description && <p className="mt-0.5 text-ink-muted">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
