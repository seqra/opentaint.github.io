import { useEffect, useRef, useState } from "react";

export function MobileRailControls({ label }: { label: string }) {
  const navigation = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const rail = navigation.current?.previousElementSibling as HTMLElement | null;
    if (!rail) return;
    const cards = Array.from(rail.children) as HTMLElement[];
    setCount(cards.length);
    const update = () => {
      const left = rail.getBoundingClientRect().left;
      setIndex(cards.reduce((nearest, card, i) =>
        Math.abs(card.getBoundingClientRect().left - left) <
        Math.abs(cards[nearest].getBoundingClientRect().left - left) ? i : nearest, 0));
    };
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => { rail.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const move = (direction: number) => {
    const rail = navigation.current?.previousElementSibling as HTMLElement | null;
    const target = rail?.children[index + direction];
    if (!rail || !target) return;
    rail.scrollBy({
      left: target.getBoundingClientRect().left - rail.getBoundingClientRect().left,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };
  const buttonClass = "min-h-11 rounded border border-border px-3 text-sm text-foreground disabled:opacity-40";
  return (
    <nav ref={navigation} aria-label={`${label} navigation`} className="mt-4 flex items-center justify-between gap-4 sm:hidden">
      <button type="button" className={buttonClass} disabled={index === 0} aria-label={`Previous card: ${label}`} onClick={() => move(-1)}>← Previous</button>
      <span className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">{count ? `${index + 1} / ${count}` : ""}</span>
      <button type="button" className={buttonClass} disabled={index >= count - 1} aria-label={`Next card: ${label}`} onClick={() => move(1)}>Next →</button>
    </nav>
  );
}
