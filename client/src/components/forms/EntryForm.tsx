import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "../../services/apiClient";
import type { Entry, EntryPayload } from "../../types/entry";
import {
  STATUS_SECTIONS,
  toEntryInput,
  toFormValues,
  validateEntryForm,
  type EntryFormErrors,
  type EntryFormValues,
} from "../../utils/entryForm";
import { COLLECTION_COLOR, COLLECTIONS, MEDIA_TYPES, STATUSES } from "../../utils/labels";
import { CandyButton } from "../ui/CandyButton";
import { ChipGroup } from "../ui/ChipGroup";
import { FavoriteFields } from "./FavoriteFields";
import { Field, FormSection } from "./Field";
import { RatingInput } from "./RatingInput";
import { TmdbPicker } from "./TmdbPicker";
import type { TmdbResult } from "../../services/entriesApi";

/**
 * The one form used by both Add Entry and Edit Entry.
 *
 * Only title / status / type / collection are required. The middle section changes
 * with the status (see STATUS_SECTIONS in utils/entryForm.ts):
 *   watched       → date watched, rating, thoughts
 *   watching      → current season / episode / timestamp
 *   abandoned     → where you stopped, rating, thoughts
 *   want_to_watch → just a note
 * Watched / watching / abandoned also get "Your mark" (♥ favourite + number, or ✕ not for me).
 * Switching status never deletes what you typed, so Watching → Watched keeps everything.
 */

interface EntryFormProps {
  initial?: Partial<Entry>;
  submitLabel: string;
  onSubmit: (payload: EntryPayload) => Promise<void>;
  onCancel: () => void;
}

export function EntryForm({ initial, submitLabel, onSubmit, onCancel }: EntryFormProps) {
  const [values, setValues] = useState<EntryFormValues>(() => toFormValues(initial));
  const [errors, setErrors] = useState<EntryFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tmdbId, setTmdbId] = useState<number | null>(initial?.tmdb_id ?? null);

  const sections = STATUS_SECTIONS[values.status];

  /** Update one field and clear its error. */
  const set = <K extends keyof EntryFormValues>(key: K, value: EntryFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (formError) setFormError(null);
  };

  /** Props for a plain text input bound to `key`. */
  const bind = (key: keyof EntryFormValues) => ({
    value: values[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    className: "field-input",
  });

  /** A TMDB match was picked: take its poster and year, and its synopsis if there isn't one yet. */
  const pickTmdb = (r: TmdbResult) => {
    setTmdbId(r.tmdb_id);
    if (r.poster_url) set("poster_url", r.poster_url);
    if (r.year) set("release_year", String(r.year));
    if (r.synopsis && !values.synopsis.trim()) set("synopsis", r.synopsis);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = validateEntryForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("A few fields need another look.");
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      // Without a picked match, the server looks one up on TMDB for new entries.
      await onSubmit({ ...toEntryInput(values), ...(tmdbId != null && { tmdb_id: tmdbId }) });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors as EntryFormErrors);
        setFormError(err.message);
        if (Object.keys(err.fieldErrors).length) focusFirstError();
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initial?.id);

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* ---------- The basics ---------- */}
      <FormSection title="The basics">
        <Field label="Title" required error={errors.title} className="sm:col-span-2">
          {(p) => <input {...p} {...bind("title")} autoFocus={!isEdit} placeholder="e.g. Lovely Runner" maxLength={200} />}
        </Field>

        <ChipField label="Status" error={errors.status} className="sm:col-span-2">
          <ChipGroup label="Status" size="md" value={values.status} onChange={(v) => set("status", v)} options={STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </ChipField>
        <ChipField label="Type" error={errors.media_type}>
          <ChipGroup label="Type" value={values.media_type} onChange={(v) => set("media_type", v)} options={MEDIA_TYPES} />
        </ChipField>
        <ChipField label="Collection" error={errors.collection}>
          <ChipGroup
            label="Collection"
            value={values.collection}
            onChange={(v) => set("collection", v)}
            options={COLLECTIONS.map((c) => ({ ...c, color: COLLECTION_COLOR[c.value] }))}
          />
        </ChipField>
      </FormSection>

      {/* ---------- Status-specific section (animates when the status changes) ---------- */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={values.status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {values.status === "want_to_watch" ? (
            <FormSection title="Why it’s on the list" description="Optional — who recommended it, what caught your eye.">
              <Field label="Note" error={errors.comment} className="sm:col-span-2">
                {(p) => <textarea {...p} {...bind("comment")} rows={3} />}
              </Field>
            </FormSection>
          ) : (
            <FormSection
              title={
                values.status === "watched"
                  ? "Your verdict"
                  : values.status === "watching"
                    ? "Where you’re at"
                    : "Where you stopped"
              }
              description="All optional — fill in whatever you remember."
            >
              <FavoriteFields
                entryId={initial?.id}
                collection={values.collection}
                mediaType={values.media_type}
                reaction={values.reaction}
                rank={values.favorite_rank}
                rankError={errors.favorite_rank}
                onReactionChange={(v) => set("reaction", v)}
                onRankChange={(v) => set("favorite_rank", v)}
              />
              {sections.verdict && (
                <Field label="Date watched" error={errors.date_watched}>
                  {(p) => <input {...p} {...bind("date_watched")} type="date" />}
                </Field>
              )}

              {sections.progress && (
                <>
                  <Field label="Last watched on" error={errors.last_watched_at}>
                    {(p) => <input {...p} {...bind("last_watched_at")} type="date" />}
                  </Field>
                  <Field label="Timestamp" hint="Like 32:14" error={errors.last_timestamp}>
                    {(p) => <input {...p} {...bind("last_timestamp")} inputMode="numeric" placeholder="mm:ss" />}
                  </Field>
                  <Field label="Season" error={errors.last_season}>
                    {(p) => <input {...p} {...bind("last_season")} type="number" min={0} inputMode="numeric" />}
                  </Field>
                  <Field label="Episode" error={errors.last_episode}>
                    {(p) => <input {...p} {...bind("last_episode")} type="number" min={0} inputMode="numeric" />}
                  </Field>
                </>
              )}

              {sections.rating && (
                <Field label="Rating" error={errors.rating} className={sections.verdict ? "" : "sm:col-span-2"}>
                  {(p) => <RatingInput {...p} value={values.rating} onChange={(v) => set("rating", v)} />}
                </Field>
              )}

              <Field label="My thoughts" error={errors.comment} className="sm:col-span-2">
                {(p) => <textarea {...p} {...bind("comment")} rows={4} placeholder="What did you think?" />}
              </Field>
            </FormSection>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ---------- Details ---------- */}
      <FormSection title="Details" description="Optional. New entries get a poster from TMDB automatically, or pick the match yourself.">
        <TmdbPicker title={values.title} mediaType={values.media_type} selectedId={tmdbId} onPick={pickTmdb} />
        <Field label="Director / creator" error={errors.director}>
          {(p) => <input {...p} {...bind("director")} />}
        </Field>
        <Field label="Release year" error={errors.release_year}>
          {(p) => <input {...p} {...bind("release_year")} type="number" min={1870} max={2100} inputMode="numeric" />}
        </Field>
        <Field label="Cast" hint="Separate names with commas" error={errors.actors} className="sm:col-span-2">
          {(p) => <input {...p} {...bind("actors")} placeholder="Byeon Woo-seok, Kim Hye-yoon" />}
        </Field>
        <Field label="Total episodes" error={errors.total_episodes}>
          {(p) => <input {...p} {...bind("total_episodes")} type="number" min={1} inputMode="numeric" />}
        </Field>
        <Field label="Poster URL" error={errors.poster_url}>
          {(p) => <input {...p} {...bind("poster_url")} type="url" placeholder="https://…" />}
        </Field>
        <Field label="Synopsis" error={errors.synopsis} className="sm:col-span-2">
          {(p) => <textarea {...p} {...bind("synopsis")} rows={4} />}
        </Field>
      </FormSection>

      {/* ---------- Actions ---------- */}
      <div className="sticky bottom-4 z-10 flex flex-col-reverse items-center justify-end gap-3 rounded-[2rem] bg-page/80 p-2 backdrop-blur-md sm:flex-row">
        {formError && (
          <p role="alert" className="mr-auto px-3 font-bold text-gum-light">
            {formError}
          </p>
        )}
        <CandyButton variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </CandyButton>
        <CandyButton type="submit" variant="pink" disabled={submitting} className="min-w-40">
          {submitting ? "Saving…" : submitLabel}
        </CandyButton>
      </div>
    </form>
  );
}

/** Label + chip group (chips have their own accessible group label). */
function ChipField({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="font-bold text-ink" aria-hidden="true">
        {label} <span className="text-gum-light">*</span>
      </span>
      {children}
      {error && <p className="text-sm font-bold text-gum-light">{error}</p>}
    </div>
  );
}

function focusFirstError() {
  // Wait a tick so aria-invalid is on the DOM, then jump to the first bad field.
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus();
  });
}
