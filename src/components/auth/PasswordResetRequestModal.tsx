"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

interface PasswordResetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestReset: (email: string) => Promise<{ error?: string; token?: string }>;
}

export default function PasswordResetRequestModal({ isOpen, onClose, onRequestReset }: PasswordResetRequestModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    const result = await onRequestReset(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-neutral-950 rounded-3xl border border-neutral-800/60 shadow-[0_0_80px_rgba(0,0,0,0.35)] p-8 md:p-10" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-900/70 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
            <span className="text-lg leading-none">&times;</span>
          </button>

          <div className="text-center mb-7">
            <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-sky-500/20">
              <Mail className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Recuperar cuenta</h2>
            <p className="text-sm text-neutral-400 mt-2">Ingresá tu email para recibir un código de recuperación.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-2xl border border-emerald-700/40 bg-emerald-950/30 px-4 py-4 text-sm text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Se generó el token de recuperación. Ahora podés cambiar tu contraseña.</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-sky-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Solicitar token"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
