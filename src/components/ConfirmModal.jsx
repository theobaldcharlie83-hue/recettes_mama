import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'default', // 'default' | 'danger'
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    const isDanger = variant === 'danger';

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
                        {isDanger ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
                    </div>

                    {title && (
                        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">{title}</h3>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all shadow-sm ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
