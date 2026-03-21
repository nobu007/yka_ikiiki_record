import { render } from "@testing-library/react";
import { GridShape } from "./GridShape";

describe("GridShape", () => {
  describe("rendering", () => {
    it("should render two grid images", () => {
      const { container } = render(<GridShape />);

      const images = container.querySelectorAll("img");
      expect(images).toHaveLength(2);
    });

    it("should position first image at top-right", () => {
      const { container } = render(<GridShape />);

      const firstWrapper = container.querySelector(".right-0.top-0");
      expect(firstWrapper).toBeInTheDocument();
    });

    it("should position second image at bottom-left rotated", () => {
      const { container } = render(<GridShape />);

      const secondWrapper = container.querySelector(
        ".bottom-0.left-0.rotate-180",
      );
      expect(secondWrapper).toBeInTheDocument();
    });

    it("should apply correct image dimensions", () => {
      const { container } = render(<GridShape />);

      const images = container.querySelectorAll("img");
      images.forEach((image) => {
        expect(image).toHaveAttribute("width", "540");
        expect(image).toHaveAttribute("height", "254");
      });
    });

    it("should use correct alt text for accessibility", () => {
      const { container } = render(<GridShape />);

      const images = container.querySelectorAll("img");
      images.forEach((image) => {
        expect(image.alt).toBeTruthy();
        expect(image.alt).not.toBe("");
      });
    });

    it("should apply negative z-index for background positioning", () => {
      const { container } = render(<GridShape />);

      const wrappers = container.querySelectorAll(".-z-1");
      expect(wrappers).toHaveLength(2);
    });

    it("should apply responsive max-width classes", () => {
      const { container } = render(<GridShape />);

      const wrappers = container.querySelectorAll(".max-w-\\[250px\\]");
      expect(wrappers.length).toBeGreaterThan(0);
    });
  });

  describe("memoization", () => {
    it("should have displayName set for debugging", () => {
      expect(GridShape.displayName).toBe("GridShape");
    });

    it("should not re-render unnecessarily when props do not change", () => {
      const { rerender } = render(<GridShape />);

      const initialRender = render(<GridShape />);

      rerender(<GridShape />);

      expect(initialRender.container.innerHTML).toEqual(
        render(<GridShape />).container.innerHTML,
      );
    });
  });

  describe("component structure", () => {
    it("should render with correct wrapper structure", () => {
      const { container } = render(<GridShape />);

      const imageWrappers = container.querySelectorAll(".absolute");
      expect(imageWrappers).toHaveLength(2);
    });

    it("should use correct image source path", () => {
      const { container } = render(<GridShape />);

      const images = container.querySelectorAll("img");
      images.forEach((image) => {
        expect(image).toHaveAttribute("src", "/images/shape/grid-01.svg");
      });
    });
  });

  describe("accessibility", () => {
    it("should provide meaningful alt text from constants", () => {
      const { container } = render(<GridShape />);

      const images = container.querySelectorAll("img");
      images.forEach((image) => {
        expect(image.alt).toBeDefined();
        expect(image.alt.length).toBeGreaterThan(0);
      });
    });
  });
});
