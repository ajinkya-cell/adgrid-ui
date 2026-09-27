"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackSlug?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PresentationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PresentationErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[350px] w-full max-w-lg flex-col items-center justify-center mx-auto p-8 rounded-2xl border border-red-500/20 bg-black/60 backdrop-blur-xl text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-1">
            Component Error
          </div>
          <h3 className="font-sans text-base font-semibold text-white/90 mb-2">
            Failed to render {this.props.fallbackSlug ?? "component"}
          </h3>
          <p className="font-mono text-xs text-white/40 max-w-sm mb-6 break-words line-clamp-3">
            {this.state.error?.message ?? "An unexpected runtime error occurred while rendering this component."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Render</span>
            </button>
            <a
              href="/gallery"
              className="px-4 py-2 rounded-lg border border-transparent text-xs font-mono text-white/50 hover:text-white transition-colors"
            >
              Return to Gallery
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
