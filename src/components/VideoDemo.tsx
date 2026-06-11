import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useThemeSync, type Theme } from "./useThemeSync";
import type { MediaSources } from "./demo-slides";

type VideoDemoProps = {
  sources: MediaSources;
  poster: MediaSources;
  alt: string;
  testId: string;
};

const pick = (s: MediaSources, theme: Theme): string => (theme === "dark" ? s.dark : s.light);

export function VideoDemo({ sources, poster, alt, testId }: VideoDemoProps) {
  const { theme, reducedMotion } = useThemeSync();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  // Honour the user's motion preference: show the static poster, no autoplay,
  // no control. Mirrors MediaDemo's reduced-motion fallback.
  if (reducedMotion) {
    return (
      <img
        data-testid={testId}
        src={pick(poster, theme)}
        alt={alt}
        loading="lazy"
        className="block h-auto w-full"
      />
    );
  }

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      // play() may reject (e.g. interrupted); ignore — the UI state is what matters.
      void video.play()?.catch?.(() => {});
      setPlaying(true);
    }
  };

  return (
    <div className="group relative w-full">
      <video
        ref={videoRef}
        data-testid={testId}
        src={pick(sources, theme)}
        poster={pick(poster, theme)}
        aria-label={alt}
        autoPlay
        loop
        muted
        playsInline
        className="block h-auto w-full"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause demo" : "Play demo"}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" aria-hidden="true" />}
      </button>
    </div>
  );
}
