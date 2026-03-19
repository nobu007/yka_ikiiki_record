import { render, screen } from "@testing-library/react";
import EventManager from "./EventManager";
import { clearMocks, defaultProps } from "./EventManager.test.setup";

describe("EventManager - rendering", () => {
  beforeEach(() => {
    clearMocks();
  });

  it("should render event input form", () => {
    render(<EventManager {...defaultProps} />);

    expect(screen.getByPlaceholderText("イベント名")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("影響度 (-1.0 〜 1.0)"),
    ).toBeInTheDocument();
    expect(screen.getByText("イベントを追加")).toBeInTheDocument();
  });

  it("should render existing events", () => {
    render(<EventManager {...defaultProps} />);

    expect(
      screen.getByText("テスト勉強会", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("運動会", { exact: false })).toBeInTheDocument();
  });

  it("should display event date ranges correctly", () => {
    render(<EventManager {...defaultProps} />);

    expect(screen.getByText(/2026\/1\/15 〜 2026\/1\/20/)).toBeInTheDocument();
    expect(screen.getByText(/2026\/2\/10 〜 2026\/2\/10/)).toBeInTheDocument();
  });

  it("should render delete buttons for each event", () => {
    render(<EventManager {...defaultProps} />);

    const deleteButtons = screen.getAllByText("削除");
    expect(deleteButtons).toHaveLength(2);
  });

  it("should render two date input fields", () => {
    render(<EventManager {...defaultProps} />);

    const allInputs = screen.getAllByDisplayValue("");
    const dateInputs = allInputs.filter(
      (input) => input.getAttribute("type") === "date",
    );
    expect(dateInputs).toHaveLength(2);
  });
});
