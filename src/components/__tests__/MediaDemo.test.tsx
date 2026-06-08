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
  it("shows the light primary source on a light page", () => {
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-light.gif");
  });

  it("shows the dark primary source on a dark page", () => {
    document.documentElement.classList.add("dark");
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-dark.gif");
  });

  it("uses the fallback source under reduced motion", () => {
    setMatchMedia(true);
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-light.png");
  });

  it("swaps to the fallback source when the primary image errors", () => {
    render(<MediaDemo sources={sources} fallback={fallback} alt="x" testId="m" />);
    const img = screen.getByTestId("m");
    fireEvent.error(img);
    expect(screen.getByTestId("m")).toHaveAttribute("src", "/a-light.png");
  });

  it("wraps the image in an external link when href is given", () => {
    render(
      <MediaDemo sources={sources} fallback={fallback} alt="open" testId="m" href="https://viewer.opentaint.org/" />,
    );
    const link = screen.getByRole("link", { name: "open" });
    expect(link).toHaveAttribute("href", "https://viewer.opentaint.org/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
