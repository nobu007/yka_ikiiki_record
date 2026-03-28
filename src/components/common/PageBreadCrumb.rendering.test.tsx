import { render, screen } from "@testing-library/react";
import { PageBreadcrumb } from "./PageBreadCrumb";

describe("PageBreadcrumb", () => {
  describe("Rendering", () => {
    it("should render page title in h2", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Test Page");
    });

    it("should render breadcrumb navigation", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should render breadcrumb list", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should render home link", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should render current page as span (not link)", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const currentPages = screen.getAllByText("Test Page");
      const spanElement = currentPages.find((el) => el.tagName === "SPAN");
      expect(spanElement).toBeDefined();
      expect(spanElement?.tagName).toBe("SPAN");
    });

    it("should render separator icon between items", () => {
      const { container } = render(<PageBreadcrumb pageTitle="Test Page" />);

      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Boundary Values", () => {
    it("should handle empty string pageTitle", () => {
      render(<PageBreadcrumb pageTitle="" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("");
    });

    it("should handle Japanese characters", () => {
      render(<PageBreadcrumb pageTitle="日本語タイトル" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("日本語タイトル");

      const currentPages = screen.getAllByText("日本語タイトル");
      const spanElement = currentPages.find((el) => el.tagName === "SPAN");
      expect(spanElement).toBeDefined();
      expect(spanElement?.tagName).toBe("SPAN");
    });

    it("should handle special characters", () => {
      render(<PageBreadcrumb pageTitle="Test & Page" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Test & Page");

      const currentPages = screen.getAllByText("Test & Page");
      const spanElement = currentPages.find((el) => el.tagName === "SPAN");
      expect(spanElement).toBeDefined();
    });

    it("should handle long titles", () => {
      const longTitle =
        "This is a very long page title that should still be displayed correctly";
      render(<PageBreadcrumb pageTitle={longTitle} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent(longTitle);
    });
  });

  describe("Structure", () => {
    it("should render exactly 2 breadcrumb items", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(2);
    });

    it("should have home as first item", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const listItems = screen.getAllByRole("listitem");
      const firstItem = listItems[0];
      expect(firstItem).toHaveTextContent(/home/i);
    });

    it("should have pageTitle as last item", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const listItems = screen.getAllByRole("listitem");
      const lastItem = listItems[1];
      expect(lastItem).toHaveTextContent("Test Page");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it("should have navigation landmark", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should have list structure for breadcrumbs", () => {
      render(<PageBreadcrumb pageTitle="Test Page" />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });
  });
});
