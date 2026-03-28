import { render } from "@testing-library/react";
import {
  CheckIcon,
  PlusIcon,
  ExclamationIcon,
  NotificationIcon,
  DownloadIcon,
} from "./Icons";

describe("CheckIcon", () => {
  it("should render with default props", () => {
    render(<CheckIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4");
    expect(svg).toHaveClass("w-4");
    expect(svg).toHaveClass("text-green-500");
    expect(svg).toHaveClass("mr-2");
    expect(svg).toHaveClass("flex-shrink-0");
  });

  it("should have aria-hidden attribute by default", () => {
    render(<CheckIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render aria-hidden as false when ariaHidden is false", () => {
    render(<CheckIcon ariaHidden={false} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });

  it("should apply custom className", () => {
    render(<CheckIcon className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct SVG attributes", () => {
    render(<CheckIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("viewBox", "0 0 20 20");
  });

  it("should render path with correct data", () => {
    render(<CheckIcon />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("fill-rule", "evenodd");
    expect(path).toHaveAttribute("clip-rule", "evenodd");
  });

  it("should have displayName for debugging", () => {
    expect(CheckIcon.displayName).toBe("CheckIcon");
  });
});

describe("PlusIcon", () => {
  it("should render with default props", () => {
    render(<PlusIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-5");
    expect(svg).toHaveClass("w-5");
    expect(svg).toHaveClass("mr-2");
  });

  it("should have aria-hidden attribute by default", () => {
    render(<PlusIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render aria-hidden as false when ariaHidden is false", () => {
    render(<PlusIcon ariaHidden={false} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });

  it("should apply custom className", () => {
    render(<PlusIcon className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct SVG attributes", () => {
    render(<PlusIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("should render path with correct stroke width", () => {
    render(<PlusIcon />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("stroke-linecap", "round");
    expect(path).toHaveAttribute("stroke-linejoin", "round");
    expect(path).toHaveAttribute("stroke-width", "2");
  });

  it("should have displayName for debugging", () => {
    expect(PlusIcon.displayName).toBe("PlusIcon");
  });
});

describe("ExclamationIcon", () => {
  it("should render with default props", () => {
    render(<ExclamationIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-6");
    expect(svg).toHaveClass("w-6");
    expect(svg).toHaveClass("text-red-400");
  });

  it("should have aria-hidden attribute by default", () => {
    render(<ExclamationIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render aria-hidden as false when ariaHidden is false", () => {
    render(<ExclamationIcon ariaHidden={false} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });

  it("should apply custom className", () => {
    render(<ExclamationIcon className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct SVG attributes", () => {
    render(<ExclamationIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("should render path with correct stroke width", () => {
    render(<ExclamationIcon />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("stroke-linecap", "round");
    expect(path).toHaveAttribute("stroke-linejoin", "round");
    expect(path).toHaveAttribute("stroke-width", "2");
  });

  it("should have displayName for debugging", () => {
    expect(ExclamationIcon.displayName).toBe("ExclamationIcon");
  });
});

describe("NotificationIcon", () => {
  it("should render success icon with green color", () => {
    render(<NotificationIcon type="success" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-green-500");
  });

  it("should render error icon with red color", () => {
    render(<NotificationIcon type="error" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-red-500");
  });

  it("should render warning icon with yellow color", () => {
    render(<NotificationIcon type="warning" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-yellow-500");
  });

  it("should render info icon with blue color", () => {
    render(<NotificationIcon type="info" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-blue-500");
  });

  it("should have aria-hidden attribute by default", () => {
    render(<NotificationIcon type="success" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render aria-hidden as false when ariaHidden is false", () => {
    render(<NotificationIcon type="success" ariaHidden={false} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });

  it("should apply custom className", () => {
    render(<NotificationIcon type="success" className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct SVG attributes", () => {
    render(<NotificationIcon type="success" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("viewBox", "0 0 20 20");
  });

  it("should render path with fill-rule evenodd", () => {
    render(<NotificationIcon type="success" />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("fill-rule", "evenodd");
    expect(path).toHaveAttribute("clip-rule", "evenodd");
  });

  it("should have correct default classes", () => {
    render(<NotificationIcon type="success" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("h-5");
    expect(svg).toHaveClass("w-5");
    expect(svg).toHaveClass("mr-3");
    expect(svg).toHaveClass("flex-shrink-0");
  });

  it("should have displayName for debugging", () => {
    expect(NotificationIcon.displayName).toBe("NotificationIcon");
  });
});

describe("DownloadIcon", () => {
  it("should render with default props", () => {
    render(<DownloadIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4");
    expect(svg).toHaveClass("w-4");
    expect(svg).toHaveClass("mr-2");
  });

  it("should have aria-hidden attribute by default", () => {
    render(<DownloadIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render aria-hidden as false when ariaHidden is false", () => {
    render(<DownloadIcon ariaHidden={false} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });

  it("should apply custom className", () => {
    render(<DownloadIcon className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct SVG attributes", () => {
    render(<DownloadIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("should render path with correct stroke width", () => {
    render(<DownloadIcon />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("stroke-linecap", "round");
    expect(path).toHaveAttribute("stroke-linejoin", "round");
    expect(path).toHaveAttribute("stroke-width", "2");
  });

  it("should have displayName for debugging", () => {
    expect(DownloadIcon.displayName).toBe("DownloadIcon");
  });
});
