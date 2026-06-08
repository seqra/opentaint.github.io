import { useState } from "react";
import { useThemeSync, type Theme } from "./useThemeSync";
import type { MediaSources } from "./demo-slides";

type MediaDemoProps = {
  sources: MediaSources;
  fallback: MediaSources;
  alt: string;
  testId: string;
  href?: string;
};

const pick = (s: MediaSources, theme: Theme): string => (theme === "dark" ? s.dark : s.light);

export function MediaDemo({ sources, fallback, alt, testId, href }: MediaDemoProps) {
  const { theme, reducedMotion } = useThemeSync();
  const [errored, setErrored] = useState(false);
  const useFallback = reducedMotion || errored;
  const src = pick(useFallback ? fallback : sources, theme);

  const img = (
    <img
      data-testid={testId}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="block h-auto w-full"
    />
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
