import { useState } from "react";
import type { Entry } from "../../types/entry";
import { PosterPlaceholder } from "./PosterPlaceholder";

/**
 * Shows the real poster when `poster_url` exists, otherwise (or if the image fails
 * to load) the generated placeholder. Once TMDB fills in poster_url, this just works.
 */
export function Poster({ entry, large = false }: { entry: Entry; large?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!entry.poster_url || failed) return <PosterPlaceholder entry={entry} large={large} />;

  return (
    <img
      src={entry.poster_url}
      alt={`Poster for ${entry.title}`}
      loading="lazy"
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
