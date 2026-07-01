import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useThemeSync } from "./useThemeSync";
import { ThemedImage } from "./ThemedImage";
import type { MediaSources } from "./demo-slides";

type VideoDemoProps = {
  sources: MediaSources;
  poster: MediaSources;
  alt: string;
  testId: string;
};

export function VideoDemo({ sources, poster, alt, testId }: VideoDemoProps) {
  const { theme, reducedMotion } = useThemeSync();
  const lightRef = useRef<HTMLVideoElement | null>(null);
  const darkRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  // Both videos render so CSS can show the theme-correct one (with its themed
  // poster) before the island hydrates — no wrong-theme flash. But only the
  // visible one is played: `preload="none"` plus no `autoPlay` keeps the hidden
  // ~4 MB source from ever being fetched. play() here loads and starts just the
  // active one; toggling theme moves playback (and the download) with it.
  useEffect(() => {
    if (reducedMotion) return;
    const active = theme === "dark" ? darkRef.current : lightRef.current;
    const inactive = theme === "dark" ? lightRef.current : darkRef.current;
    inactive?.pause();
    if (playing) {
      // play() may reject (e.g. interrupted); ignore — the UI state is what matters.
      void active?.play()?.catch?.(() => {});
    } else {
      active?.pause();
    }
  }, [theme, reducedMotion, playing]);

  // Honour the user's motion preference: show the static poster, no autoplay,
  // no control. Mirrors MediaDemo's reduced-motion fallback.
  if (reducedMotion) {
    return <ThemedImage sources={poster} alt={alt} testId={testId} />;
  }

  return (
    <div className="group relative w-full">
      <video
        ref={lightRef}
        data-testid={testId}
        src={sources.light}
        poster={poster.light}
        aria-label={alt}
        loop
        muted
        playsInline
        preload="none"
        className="block h-auto w-full dark:hidden"
      />
      <video
        ref={darkRef}
        data-testid={`${testId}-dark`}
        src={sources.dark}
        poster={poster.dark}
        aria-label={alt}
        loop
        muted
        playsInline
        preload="none"
        className="hidden h-auto w-full dark:block"
      />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause demo" : "Play demo"}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" aria-hidden="true" />}
      </button>
    </div>
  );
}
