'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationIcon } from './Icons';

const ERROR_MESSAGES = {
  title: 'エラーが発生しました',
  description: 'アプリケーションで予期せぬエラーが発生しました。',
  action: 'ページを更新するか、後でもう一度お試しください。',
  buttonText: 'ページを更新',
  devDetails: 'エラー詳細（開発モード）'
} as const;

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private renderErrorDetails = (): ReactNode => {
    if (process.env.NODE_ENV !== 'development' || !this.state.error) {
      return null;
    }

    return (
      <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <summary>{ERROR_MESSAGES.devDetails}</summary>
        <pre className="mt-2 whitespace-pre-wrap">
          {this.state.error.stack}
        </pre>
      </details>
    );
  };

  private renderDefaultError = (): ReactNode => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ExclamationIcon />
          <h3 className="ml-3 text-sm font-medium text-gray-800">{ERROR_MESSAGES.title}</h3>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>{ERROR_MESSAGES.description}</p>
          <p className="mt-2">{ERROR_MESSAGES.action}</p>
        </div>
        
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={this.handleReload}
        >
          {ERROR_MESSAGES.buttonText}
        </button>
        
        {this.renderErrorDetails()}
      </div>
    </div>
  );

  render() {
    return this.state.hasError 
      ? (this.props.fallback || this.renderDefaultError())
      : this.props.children;
  }
}