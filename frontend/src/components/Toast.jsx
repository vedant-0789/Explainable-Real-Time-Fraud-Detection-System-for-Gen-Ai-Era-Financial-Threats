import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, X, Info } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { id, type, message, title } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'danger':
      case 'error':
        return <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/90';
      case 'danger':
      case 'error':
        return 'border-rose-500/30 bg-rose-950/90';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/90';
      default:
        return 'border-indigo-500/30 bg-slate-900/90';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
      <div className={`flex items-start space-x-3 p-4 rounded-xl border ${getBorderColor()} backdrop-blur-md shadow-2xl max-w-md`}>
        {getIcon()}
        <div className="flex-1 pr-2">
          {title && <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>}
          <p className="text-xs font-medium text-slate-200 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
