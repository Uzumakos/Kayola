import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { activeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            layout="position"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium ${
              activeToast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : activeToast.type === 'info'
                ? 'bg-[#171717] text-white border-[#222222]'
                : 'bg-[#171717] text-white border-[#EF5A33]/40'
            }`}
          >
            {activeToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : activeToast.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#EF5A33] shrink-0" />
            )}
            <span>{activeToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
