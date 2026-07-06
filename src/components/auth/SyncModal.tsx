"use client";

import React, { useState } from "react";
import { X, Loader2, ArrowLeftRight, Cloud, HardDrive, Ban } from "lucide-react";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (mode: 'merge' | 'overwrite_cloud' | 'keep_cloud') => Promise<void>;
}

export default function SyncModal({ isOpen, onClose, onSync }: SyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<'merge' | 'overwrite_cloud' | 'keep_cloud' | null>(null);

  if (!isOpen) return null;

  const handleSync = async (mode: 'merge' | 'overwrite_cloud' | 'keep_cloud') => {
    setSelected(mode);
    setLoading(true);
    await onSync(mode);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ArrowLeftRight className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Sincronizar Progreso</h2>
          <p className="text-sm text-neutral-400 mt-1">Se encontró progreso local. ¿Qué deseas hacer?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSync("merge")}
            disabled={loading}
            className="w-full p-4 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-indigo-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Fusionar</div>
                <div className="text-xs text-neutral-400">Mezclar ambos sin perder nada. Se unen los datos locales y de la nube.</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSync("overwrite_cloud")}
            disabled={loading}
            className="w-full p-4 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-amber-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Sobrescribir nube</div>
                <div className="text-xs text-neutral-400">Tu progreso local reemplaza lo que haya en la nube.</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSync("keep_cloud")}
            disabled={loading}
            className="w-full p-4 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-emerald-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Mantener nube</div>
                <div className="text-xs text-neutral-400">Conservar lo que ya tenés guardado en la nube. Se descarta el progreso local.</div>
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full p-3 rounded-xl border border-neutral-700/50 text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all text-center text-sm font-bold disabled:opacity-50"
          >
            <Ban className="w-4 h-4 inline mr-1.5" />
            Cancelar
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold">Sincronizando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
