import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaDemo } from "../MediaDemo";

const sources = { light: "/a-light.gif", dark: "/a-dark.gif" };
const fallback = { light: "/a-light.png", dark: "/a-dark.png" };

const setMatchMedia = (reduced: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  setMatchMedia(false);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MediaDemo", () => {
  // Theme is chosen by CSS off the `.dark` class, not JS, so both variants are
  // always rendered and the correct one shows before the island hydrates.
  it("renders both the light and dark primary sources for a CSS theme swap", () => {
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    const light = screen.getByTestId("m");
    const dark = screen.getByTestId("m-dark");
    expect(light).toHaveAttribute("src", "/a-light.gif");
    expect(dark).toHaveAttribute("src", "/a-dark.gif");
    // The light image hides and the dark image shows once `.dark` is present.
    expect(light.className).toContain("dark:hidden");
    expect(dark.className).toContain("dark:block");
  });

  it("uses the fallback sources under reduced motion", () => {
    setMatchMedia(true);
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-light.png");
    expect(screen.getByTestId("m-dark")).toHaveAttribute("src", "/a-dark.png");
  });

  it("swaps to the fallback sources when the primary image errors", () => {
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    fireEvent.error(screen.getByTestId("m"));
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-light.png");
    expect(screen.getByTestId("m-dark")).toHaveAttribute("src", "/a-dark.png");
  });

  it("wraps the images in an external link when href is given", () => {
    render(
      <MediaDemo sources={sources} fallback={fallback} alt="open" testId="m" href="https://viewer.opentaint.org/" />,
    );
    const link = screen.getByRole("link", { name: "open" });
    expect(link).toHaveAttribute("href", "https://viewer.opentaint.org/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // Both themed images live inside the single link.
    expect(screen.getByTestId("m").closest("a")).toBe(link);
    expect(screen.getByTestId("m-dark").closest("a")).toBe(link);
  });
});
