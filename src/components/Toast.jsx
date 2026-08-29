import React from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toast } = useCart();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-black border-l-4 border-[#C52222] border-t border-r border-b border-neutral-800 px-4 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="text-[#C52222]">
        <Check className="w-5 h-5" />
      </div>
      <span className="text-xs font-condensed font-semibold tracking-wider text-neutral-200 uppercase">
        {toast.message}
      </span>
    </div>
  );
};
