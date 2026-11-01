import { render, screen } from "@testing-library/react";
import EventManager from "./EventManager";
import { clearMocks, defaultProps } from "./EventManager.test.setup";

describe("EventManager - rendering", () => {
  beforeEach(() => {
    clearMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it.each([
    ["en-US", "UTC"],
    ["ja-JP", "Asia/Tokyo"],
    ["en-US", "America/Los_Angeles"],
    ["ar-EG", "Pacific/Kiritimati"],
  ])(
    "should preserve event calendar dates with %s locale and %s time zone",
    (defaultLocale, defaultTimeZone) => {
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      jest.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(
        function (this: Date, locales, options) {
          return originalToLocaleDateString.call(
            this,
            locales ?? defaultLocale,
            { timeZone: defaultTimeZone, ...options },
          );
        },
      );

      render(
        <EventManager
          {...defaultProps}
          events={[
            ...defaultProps.events,
            {
              name: "年越し行事",
              startDate: new Date("2025-12-31"),
              endDate: new Date("2026-01-01"),
              impact: 0,
            },
            {
              name: "うるう日行事",
              startDate: new Date("2024-02-29"),
              endDate: new Date("2024-03-01"),
              impact: 0,
            },
          ]}
        />,
      );

      expect(screen.getByText(/2026\/1\/15 〜 2026\/1\/20/)).toBeInTheDocument();
      expect(screen.getByText(/2026\/2\/10 〜 2026\/2\/10/)).toBeInTheDocument();
      expect(screen.getByText(/2025\/12\/31 〜 2026\/1\/1/)).toBeInTheDocument();
      expect(screen.getByText(/2024\/2\/29 〜 2024\/3\/1/)).toBeInTheDocument();
    },
  );

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
