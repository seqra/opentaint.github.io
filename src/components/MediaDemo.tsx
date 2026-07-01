import { useState } from "react";
import { useThemeSync } from "./useThemeSync";
import { ThemedImage } from "./ThemedImage";
import type { MediaSources } from "./demo-slides";

type MediaDemoProps = {
  sources: MediaSources;
  fallback: MediaSources;
  alt: string;
  testId: string;
  href?: string;
};

export function MediaDemo({ sources, fallback, alt, testId, href }: MediaDemoProps) {
  // Theme is handled by CSS in ThemedImage; JS only chooses the primary set vs
  // the static fallback (reduced motion, or a load error).
  const { reducedMotion } = useThemeSync();
  const [errored, setErrored] = useState(false);
  const active = reducedMotion || errored ? fallback : sources;

  const img = (
    <ThemedImage sources={active} alt={alt} testId={testId} onError={() => setErrored(true)} />
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={alt} className="block w-full">
        {img}
      </a>
    );
  }
  return img;
}
