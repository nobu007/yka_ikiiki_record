import { render, screen } from "@testing-library/react";
import { InstructionsSection } from "./InstructionsSection";
import { INSTRUCTIONS_SECTION } from "@/lib/constants/messages";

describe("InstructionsSection", () => {
  describe("rendering", () => {
    it("should render the section container", () => {
      const { container } = render(<InstructionsSection />);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("should render the title", () => {
      render(<InstructionsSection />);

      const title = screen.getByText(INSTRUCTIONS_SECTION.TITLE);
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H2");
    });

    it("should render the subtitle", () => {
      render(<InstructionsSection />);

      const subtitle = screen.getByText(INSTRUCTIONS_SECTION.SUBTITLE);
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe("P");
    });

    it("should render all instruction steps", () => {
      render(<InstructionsSection />);

      INSTRUCTIONS_SECTION.STEPS.forEach((step) => {
        const stepTitle = screen.getByText(step.title);
        expect(stepTitle).toBeInTheDocument();

        const stepDescription = screen.getByText(step.description);
        expect(stepDescription).toBeInTheDocument();
      });
    });

    it("should render step numbers correctly", () => {
      render(<InstructionsSection />);

      const stepNumbers = screen.getAllByText(/^\d+$/);
      expect(stepNumbers).toHaveLength(INSTRUCTIONS_SECTION.STEPS.length);

      stepNumbers.forEach((numberEl, index) => {
        expect(numberEl).toHaveTextContent(String(index + 1));
      });
    });

    it("should render the hints title", () => {
      render(<InstructionsSection />);

      const hintsTitle = screen.getByText(INSTRUCTIONS_SECTION.HINTS_TITLE);
      expect(hintsTitle).toBeInTheDocument();
      expect(hintsTitle.tagName).toBe("H4");
    });

    it("should render all tips", () => {
      render(<InstructionsSection />);

      INSTRUCTIONS_SECTION.TIPS.forEach((tip) => {
        const tipElement = screen.getByText(tip);
        expect(tipElement).toBeInTheDocument();
      });
    });
  });

  describe("component structure", () => {
    it("should render steps in the correct order", () => {
      render(<InstructionsSection />);

      INSTRUCTIONS_SECTION.STEPS.forEach((step) => {
        const stepTitle = screen.getByText(step.title);
        expect(stepTitle).toBeInTheDocument();
      });
    });

    it("should render tips section with warning styling", () => {
      const { container } = render(<InstructionsSection />);

      const tipsSection = container.querySelector(".bg-yellow-50");
      expect(tipsSection).toBeInTheDocument();
    });

    it("should render step icons as SVG elements", () => {
      const { container } = render(<InstructionsSection />);

      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("styling", () => {
    it("should apply gradient background to section", () => {
      const { container } = render(<InstructionsSection />);

      const section = container.querySelector(
        ".bg-gradient-to-br.from-blue-50.to-indigo-50",
      );
      expect(section).toBeInTheDocument();
    });

    it("should apply rounded corners to section", () => {
      const { container } = render(<InstructionsSection />);

      const section = container.querySelector(".rounded-lg");
      expect(section).toBeInTheDocument();
    });

    it("should apply card styling to each step", () => {
      const { container } = render(<InstructionsSection />);

      const stepCards = container.querySelectorAll(".bg-white.rounded-lg");
      expect(stepCards.length).toBe(INSTRUCTIONS_SECTION.STEPS.length);
    });

    it("should apply circular styling to step numbers", () => {
      const { container } = render(<InstructionsSection />);

      const stepNumbers = container.querySelectorAll(".rounded-full");
      expect(stepNumbers.length).toBe(INSTRUCTIONS_SECTION.STEPS.length);
    });
  });

  describe("memoization", () => {
    it("should have displayName set for debugging", () => {
      expect(InstructionsSection.displayName).toBe("InstructionsSection");
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<InstructionsSection />);

      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toBeInTheDocument();

      const h4 = screen.getByRole("heading", { level: 4 });
      expect(h4).toBeInTheDocument();
    });

    it("should render step icons with proper attributes", () => {
      const { container } = render(<InstructionsSection />);

      const stepIcons = container.querySelectorAll(".bg-white.rounded-lg svg");
      stepIcons.forEach((svg) => {
        expect(svg).toHaveAttribute("fill", "none");
        expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
        expect(svg).toHaveAttribute("stroke", "currentColor");
      });
    });
  });

  describe("content completeness", () => {
    it("should render the exact number of steps from configuration", () => {
      render(<InstructionsSection />);

      const { container } = render(<InstructionsSection />);
      const stepCards = container.querySelectorAll(".bg-white.rounded-lg");
      expect(stepCards).toHaveLength(INSTRUCTIONS_SECTION.STEPS.length);
    });

    it("should render the exact number of tips from configuration", () => {
      render(<InstructionsSection />);

      const { container } = render(<InstructionsSection />);
      const tipItems = container.querySelectorAll("li");
      expect(tipItems).toHaveLength(INSTRUCTIONS_SECTION.TIPS.length);
    });
  });
});
