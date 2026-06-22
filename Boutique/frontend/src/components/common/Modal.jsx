import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-card animate-fadeUp`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100">
            <IoClose size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
