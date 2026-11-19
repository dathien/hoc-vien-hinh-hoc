import React from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

interface WebGLErrorBoundaryProps {
  onFallback2D?: () => void;
  children: React.ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Không thể khởi tạo khung hiển thị 3D WebGL.',
    };
  }

  componentDidCatch(error: Error): void {
    console.error('[3D Viewport ErrorBoundary]', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[380px] rounded-2xl border border-amber-200 bg-amber-50/70 dark:bg-slate-900 dark:border-amber-800/60 p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Thiết bị hoặc trình duyệt chưa khởi tạo được đồ họa 3D WebGL
            </h3>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {this.state.errorMessage} Bạn có thể thử tải lại khung 3D hoặc quay về không gian dựng hình phẳng 2D mà không mất dữ liệu.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
            >
              <RefreshCw className="w-4 h-4" />
              Thử tải lại khung 3D
            </button>
            {this.props.onFallback2D && (
              <button
                type="button"
                onClick={this.props.onFallback2D}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-[15px] font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay về Dựng hình phẳng 2D
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
