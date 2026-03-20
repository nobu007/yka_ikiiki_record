import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  mockWindowLocation,
  mockProcessEnv,
} from "@/test-utils/component-helpers";
import { reloadPage } from "@/lib/constants/browser";

jest.mock("@/lib/constants/browser", () => ({
  ...jest.requireActual("@/lib/constants/browser"),
  reloadPage: jest.fn(),
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("ErrorBoundary", () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }
    return <div>No error</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  test("displays error UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(
      screen.getByText("アプリケーションで予期せぬエラーが発生しました。"),
    ).toBeInTheDocument();
    expect(screen.getByText("ページを更新")).toBeInTheDocument();
  });

  test("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error fallback</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    expect(screen.queryByText("エラーが発生しました")).not.toBeInTheDocument();
  });

  test("reloads page when reload button is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByText("ページを更新");
    fireEvent.click(reloadButton);

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  test("logs error to console when error occurs", () => {
    const testError = new Error("Test error");
    const ThrowSpecificError = () => {
      throw testError;
    };

    render(
      <ErrorBoundary>
        <ThrowSpecificError />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });

  describe("development mode", () => {
    let restoreEnv: () => void;

    beforeAll(() => {
      const envRestore = mockProcessEnv("development");
      restoreEnv = envRestore.restore;
    });

    afterAll(() => {
      restoreEnv();
    });

    test("shows error details in development mode", () => {
      const testError = new Error("Test error with stack");
      testError.stack = "Error: Test error with stack\n    at TestComponent";

      const ThrowErrorWithStack = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithStack />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラー詳細（開発モード）")).toBeInTheDocument();
    });
  });

  describe("production mode", () => {
    let restoreEnv: () => void;

    beforeAll(() => {
      const envRestore = mockProcessEnv("production");
      restoreEnv = envRestore.restore;
    });

    afterAll(() => {
      restoreEnv();
    });

    test("hides error details in production mode", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(
        screen.queryByText("エラー詳細（開発モード）"),
      ).not.toBeInTheDocument();
    });
  });
});
