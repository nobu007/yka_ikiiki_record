import { render, screen } from "@testing-library/react";
import { ComponentCard } from "./ComponentCard";

describe("ComponentCard", () => {
  describe("SPEC: ComponentCard — 正常系", () => {
    it("should render title correctly", () => {
      render(<ComponentCard title="Test Title">Content</ComponentCard>);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <ComponentCard title="Card Title">
          <p>Child content</p>
        </ComponentCard>
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("should render description when desc prop is provided", () => {
      render(
        <ComponentCard title="Title" desc="Description text">
          Content
        </ComponentCard>
      );
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ComponentCard title="Title" className="custom-class">
          Content
        </ComponentCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("custom-class");
    });

    it("should render with default card styling", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("rounded-2xl");
      expect(card.className).toContain("border");
    });

    it("should support dark mode classes", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("dark:border-gray-800");
      expect(card.className).toContain("dark:bg-white/[0.03]");
    });
  });

  describe("SPEC: ComponentCard — 境界値", () => {
    it("should render with empty string title", () => {
      const { container } = render(
        <ComponentCard title="">Content</ComponentCard>
      );
      const title = container.querySelector("h3");
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe("");
      expect(title?.tagName).toBe("H3");
    });

    it("should not render description when desc is empty string", () => {
      const { container } = render(
        <ComponentCard title="Title" desc="">
          Content
        </ComponentCard>
      );
      const description = container.querySelector("p");
      expect(description).toBeNull();
    });

    it("should not render description when desc prop is not provided", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const description = container.querySelector("p");
      expect(description).toBeNull();
    });

    it("should render with no className (default empty string)", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toBeTruthy();
    });

    it("should render multiple children", () => {
      render(
        <ComponentCard title="Title">
          <p>First child</p>
          <p>Second child</p>
          <p>Third child</p>
        </ComponentCard>
      );
      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
      expect(screen.getByText("Third child")).toBeInTheDocument();
    });

    it("should wrap children in space-y-6 container", () => {
      const { container } = render(
        <ComponentCard title="Title">
          <p>Child 1</p>
          <p>Child 2</p>
        </ComponentCard>
      );
      const childrenContainer = container.querySelector(".space-y-6");
      expect(childrenContainer).toBeInTheDocument();
    });
  });

  describe("SPEC: ComponentCard — レンダリング構造", () => {
    it("should render title in h3 tag with correct classes", () => {
      render(<ComponentCard title="Test Title">Content</ComponentCard>);
      const title = screen.getByText("Test Title");
      expect(title.tagName).toBe("H3");
      expect(title.className).toContain("text-base");
      expect(title.className).toContain("font-medium");
      expect(title.className).toContain("text-gray-800");
      expect(title.className).toContain("dark:text-white/90");
    });

    it("should render description in p tag with correct classes", () => {
      render(
        <ComponentCard title="Title" desc="Test Description">
          Content
        </ComponentCard>
      );
      const description = screen.getByText("Test Description");
      expect(description.tagName).toBe("P");
      expect(description.className).toContain("text-sm");
      expect(description.className).toContain("text-gray-500");
      expect(description.className).toContain("dark:text-gray-400");
    });

    it("should render title section with px-6 py-5 classes", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const titleSection = container.querySelector(".px-6.py-5");
      expect(titleSection).toBeInTheDocument();
    });

    it("should render children section with border-t", () => {
      const { container } = render(
        <ComponentCard title="Title">Content</ComponentCard>
      );
      const childrenSection = container.querySelector(".border-t");
      expect(childrenSection).toBeInTheDocument();
    });
  });

  describe("SPEC: ComponentCard — React.memo", () => {
    it("should have displayName set to ComponentCard", () => {
      expect(ComponentCard.displayName).toBe("ComponentCard");
    });
  });

  describe("SPEC: ComponentCard — accessibility", () => {
    it("should use semantic HTML elements", () => {
      render(<ComponentCard title="Title">Content</ComponentCard>);
      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toBeInTheDocument();
    });
  });

  describe("SPEC: ComponentCard — integration", () => {
    it("should work with complex children components", () => {
      const TestChild = () => <div>Complex child content</div>;
      render(
        <ComponentCard title="Parent Card">
          <TestChild />
        </ComponentCard>
      );
      expect(screen.getByText("Complex child content")).toBeInTheDocument();
    });

    it("should work with nested ComponentCard instances", () => {
      render(
        <ComponentCard title="Outer Card">
          <ComponentCard title="Inner Card">Nested content</ComponentCard>
        </ComponentCard>
      );
      expect(screen.getByText("Outer Card")).toBeInTheDocument();
      expect(screen.getByText("Inner Card")).toBeInTheDocument();
      expect(screen.getByText("Nested content")).toBeInTheDocument();
    });
  });
});
