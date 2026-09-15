import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Đã xảy ra lỗi không mong muốn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Hệ thống đã ghi nhận sự cố này. Vui lòng tải lại trang hoặc quay về trang chủ.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left border border-slate-100 max-h-32 overflow-auto">
                <p className="text-[11px] font-mono text-rose-600 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReload}
                className="w-full sm:w-auto text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Tải lại trang
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                className="w-full sm:w-auto text-xs"
              >
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Về Trang chủ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
