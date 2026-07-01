import type { MediaSources } from "./demo-slides";

type ThemedImageProps = {
  sources: MediaSources;
  alt: string;
  testId: string;
  onError?: () => void;
};

// Render both the light and dark asset and let CSS pick which one shows, keyed
// off the `.dark` class on <html>. That class is set by the inline head script
// before first paint, so the correct variant is visible immediately — with no
// dependency on JS or island hydration. Relying on the React theme state
// instead would bake the light asset into the SSR HTML and only correct it once
// the `client:visible` island hydrates, flashing the light demo on a dark page.
//
// Both images carry the real alt text; the hidden one is `display:none`, which
// assistive tech skips, so exactly one is ever announced regardless of theme.
export function ThemedImage({ sources, alt, testId, onError }: ThemedImageProps) {
  return (
    <>
      <img
        data-testid={testId}
        src={sources.light}
        alt={alt}
        loading="lazy"
        onError={onError}
        className="block h-auto w-full dark:hidden"
      />
      <img
        data-testid={`${testId}-dark`}
        src={sources.dark}
        alt={alt}
        loading="lazy"
        onError={onError}
        className="hidden h-auto w-full dark:block"
      />
    </>
  );
}
