'use client';

import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <Alert className="m-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">
              An error occurred while rendering this component.
            </p>
            <Button size="sm" onClick={this.resetError}>
              Try again
            </Button>
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <Alert className="m-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Oops! Something went wrong</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <Button size="sm" onClick={resetError}>
          Reload
        </Button>
      </div>
    </Alert>
  );
}
