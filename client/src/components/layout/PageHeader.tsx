import type { ReactNode } from "react";
import { Bubble } from "../ui/Bubble";
import { BubbleTitle, TITLE_SIZES } from "../ui/BubbleTitle";

/** Big bubble-letter page title (same style as the home page, smaller) + optional subtitle/actions. */
interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <div className={`relative ${TITLE_SIZES.page}`}>
        {/* Decorative bubbles — hidden on phones where they'd hit the screen edge. */}
        <div className="hidden sm:contents">
          <Bubble tone="pink" size="0.3em" style={{ left: "-0.55em", top: "18%" }} />
          <Bubble tone="cream" size="0.14em" style={{ right: "-0.35em", top: "6%" }} delay={0.1} />
          <Bubble tone="lavender" size="0.12em" style={{ right: "-0.5em", bottom: "14%" }} delay={0.2} />
        </div>
        <BubbleTitle text={title} size="page" />
      </div>
      {subtitle && <p className="font-candy text-xl tracking-wide text-ink-muted">{subtitle}</p>}
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
