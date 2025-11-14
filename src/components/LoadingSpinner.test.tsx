import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render with default medium size", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("h-8", "w-8");
  });

  it("should render with small size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toHaveClass("h-4", "w-4");
  });

  it("should render with large size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toHaveClass("h-12", "w-12");
  });

  it("should have proper spinner styles", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toHaveClass("rounded-full");
    expect(spinner).toHaveClass("border-b-2");
    expect(spinner).toHaveClass("border-blue-600");
  });

  it("should be centered in container", () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;

    expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
  });
});
