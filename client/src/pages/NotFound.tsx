import { BubbleTitle } from "../components/ui/BubbleTitle";
import { CandyLink } from "../components/ui/CandyButton";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <BubbleTitle text="404" size="hero" />
      <p className="mt-6 font-candy text-2xl tracking-wide text-ink-muted">This page wandered off the shelf.</p>
      <CandyLink to="/" className="mt-8">
        Take me home
      </CandyLink>
    </div>
  );
}
