'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                    <div className="text-center max-w-md">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-900 mb-2">
                            Algo salió mal
                        </h1>
                        <p className="text-stone-600 mb-6">
                            Encontramos un error inesperado. Por favor, intenta de nuevo.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Recargar
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-moma-green text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Home className="w-4 h-4" />
                                Ir al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
