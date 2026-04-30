import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-8 bg-red-50 text-red-900 font-mono text-sm overflow-auto">
          <h1 className="text-xl font-bold red-600 mb-4">Đã xảy ra lỗi hệ thống</h1>
          <p className="mb-4">Xin lỗi, ứng dụng đã gặp lỗi và không thể tải được. Dưới đây là thông tin lỗi:</p>
          <pre className="bg-white p-4 rounded shadow">
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
