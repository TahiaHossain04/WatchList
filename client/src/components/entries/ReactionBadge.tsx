import type { Reaction } from "../../types/entry";

/**
 * The little heart / cross stickers on tapes, posters and the entry page.
 *   heart  = one of Tahia's favourites (with her number inside, if she gave it one)
 *   cross  = watched it, didn't love it
 */
interface ReactionBadgeProps {
  reaction: Reaction | null;
  rank?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "size-6 text-[0.62rem]", md: "size-8 text-[0.8rem]", lg: "size-11 text-base" };

export function ReactionBadge({ reaction, rank, size = "sm", className = "" }: ReactionBadgeProps) {
  if (!reaction) return null;

  if (reaction === "dislike") {
    return (
      <span
        className={`grid place-items-center rounded-full bg-(--color-dislike) text-white shadow-md ring-2 ring-page ${SIZES[size]} ${className}`}
        aria-label="Not a favourite"
        role="img"
      >
        <svg viewBox="0 0 24 24" className="size-1/2" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`heart-badge relative grid place-items-center ${SIZES[size]} ${className}`}
      aria-label={rank ? `Favourite number ${rank}` : "Favourite"}
      role="img"
    >
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.5 6.6 4.5c2.2 0 3.7 1.2 5.4 3.2 1.7-2 3.2-3.2 5.4-3.2 3.7 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21Z"
          fill="var(--color-pink-primary)"
          stroke="var(--color-pink-soft)"
          strokeWidth="1.4"
        />
        <ellipse cx="6.3" cy="7.6" rx="1" ry="1.5" fill="#fff" opacity="0.8" transform="rotate(-35 6.3 7.6)" />
      </svg>
      {rank ? (
        <span className="relative -mt-[10%] font-body leading-none font-black text-white [text-shadow:0_1px_1px_rgb(160_20_90/0.6)]" aria-hidden="true">
          {rank}
        </span>
      ) : null}
    </span>
  );
}
