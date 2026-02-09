'use client';

import { X, AlertTriangle } from 'lucide-react';

interface DeleteBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookingInfo: {
        customerName: string;
        experienceTitle: string;
        travelDate: string;
    };
    loading: boolean;
}

export default function DeleteBookingModal({
    isOpen,
    onClose,
    onConfirm,
    bookingInfo,
    loading
}: DeleteBookingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5 text-stone-400" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-center text-[#1a1a1a] dark:text-white mb-2 px-8">
                    ¿Eliminar Reserva?
                </h3>

                {/* Description */}
                <p className="text-center text-stone-500 dark:text-stone-400 mb-6 px-4 text-sm">
                    Esta acción no se puede deshacer.
                </p>

                {/* Booking Info */}
                <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-6 space-y-3">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-baseline">
                        <span className="text-xs font-bold text-stone-400 uppercase whitespace-nowrap">Cliente</span>
                        <span className="text-sm font-bold text-[#1a1a1a] dark:text-white text-right wrap-break-word overflow-wrap-anywhere">
                            {bookingInfo.customerName}
                        </span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-baseline">
                        <span className="text-xs font-bold text-stone-400 uppercase whitespace-nowrap">Experiencia</span>
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-300 text-right wrap-break-word overflow-wrap-anywhere">
                            {bookingInfo.experienceTitle}
                        </span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-baseline">
                        <span className="text-xs font-bold text-stone-400 uppercase whitespace-nowrap">Fecha</span>
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-300 text-right">
                            {bookingInfo.travelDate}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
