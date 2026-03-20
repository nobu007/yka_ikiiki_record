"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationIcon } from "./Icons";
import { globalLogger } from "@/lib/resilience/structured-logger";
import { ERROR_BOUNDARY_MESSAGES } from "@/lib/constants/messages";
import { reloadPage } from "@/lib/constants/browser";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    globalLogger.error(
      "ErrorBoundary",
      "componentDidCatch",
      {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      },
      "INTERNAL",
    );
  }

  private handleReload = (): void => {
    reloadPage();
  };

  private renderErrorDetails = (): ReactNode => {
    if (process.env.NODE_ENV !== "development" || !this.state.error) {
      return null;
    }

    return (
      <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <summary>{ERROR_BOUNDARY_MESSAGES.DEV_DETAILS}</summary>
        <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
      </details>
    );
  };

  private renderDefaultError = (): ReactNode => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ExclamationIcon />
          <h3 className="ml-3 text-sm font-medium text-gray-800">
            {ERROR_BOUNDARY_MESSAGES.TITLE}
          </h3>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>{ERROR_BOUNDARY_MESSAGES.DESCRIPTION}</p>
          <p className="mt-2">{ERROR_BOUNDARY_MESSAGES.ACTION}</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={this.handleReload}
        >
          {ERROR_BOUNDARY_MESSAGES.BUTTON_TEXT}
        </button>

        {this.renderErrorDetails()}
      </div>
    </div>
  );

  override render() {
    return this.state.hasError
      ? this.props.fallback || this.renderDefaultError()
      : this.props.children;
  }
}
