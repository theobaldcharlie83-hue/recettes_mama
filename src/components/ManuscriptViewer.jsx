import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ManuscriptViewer({ images, initialIndex = 0, onClose }) {
    const [index, setIndex] = useState(initialIndex);
    const [zoomed, setZoomed] = useState(false);

    const total = images.length;

    const goPrev = useCallback((e) => {
        e?.stopPropagation();
        setZoomed(false);
        setIndex((i) => (i - 1 + total) % total);
    }, [total]);

    const goNext = useCallback((e) => {
        e?.stopPropagation();
        setZoomed(false);
        setIndex((i) => (i + 1) % total);
    }, [total]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        document.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [onClose, goPrev, goNext]);

    const src = `/manuscript/full/${images[index]}`;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col touch-none"
            onClick={onClose}
        >
            <div className="flex items-center justify-between p-4 text-white/90 z-10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur">
                    Page manuscrite {total > 1 ? `${index + 1}/${total}` : ''}
                </span>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                    aria-label="Fermer"
                >
                    <X size={22} className="text-white" />
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-0">
                {total > 1 && (
                    <button
                        onClick={goPrev}
                        className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                        aria-label="Page précédente"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.img
                            src={src}
                            alt={`Page manuscrite ${index + 1}`}
                            drag={zoomed}
                            dragMomentum={false}
                            dragElastic={0.05}
                            onDoubleClick={() => setZoomed((z) => !z)}
                            animate={{ scale: zoomed ? 2.2 : 1 }}
                            transition={{ duration: 0.25 }}
                            className={`max-w-full max-h-full object-contain select-none ${zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                            draggable={false}
                        />
                    </motion.div>
                </AnimatePresence>

                {total > 1 && (
                    <button
                        onClick={goNext}
                        className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                        aria-label="Page suivante"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-center gap-2 pb-3 pt-2 text-white/60 text-xs flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ZoomIn size={14} /> Double-tap pour zoomer
            </div>

            {total > 1 && (
                <div className="flex items-center justify-center gap-1.5 pb-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setZoomed(false); setIndex(i); }}
                            className={`h-1.5 rounded-full transition-all ${i === index ? 'bg-white w-4' : 'bg-white/30 w-1.5'}`}
                            aria-label={`Aller à la page ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </motion.div>,
        document.body
    );
}
