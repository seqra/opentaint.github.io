import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemedImage } from "../ThemedImage";

const sources = { light: "/x-light.png", dark: "/x-dark.png" };

afterEach(cleanup);

describe("ThemedImage", () => {
  it("renders a light and dark image toggled by the dark class", () => {
    render(<ThemedImage sources={sources} alt="pic" testId="t" />);
    const light = screen.getByTestId("t");
    const dark = screen.getByTestId("t-dark");
    expect(light).toHaveAttribute("src", "/x-light.png");
    expect(dark).toHaveAttribute("src", "/x-dark.png");
    expect(light.className).toContain("block");
    expect(light.className).toContain("dark:hidden");
    expect(dark.className).toContain("hidden");
    expect(dark.className).toContain("dark:block");
  });

  it("gives both images the real alt so exactly one is announced per theme", () => {
    render(<ThemedImage sources={sources} alt="pic" testId="t" />);
    expect(screen.getByTestId("t")).toHaveAttribute("alt", "pic");
    expect(screen.getByTestId("t-dark")).toHaveAttribute("alt", "pic");
  });

  it("reports errors from either image so the caller can fall back", () => {
    const onError = vi.fn();
    render(<ThemedImage sources={sources} alt="pic" testId="t" onError={onError} />);
    fireEvent.error(screen.getByTestId("t"));
    fireEvent.error(screen.getByTestId("t-dark"));
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
