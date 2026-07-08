"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Key, Loader2, ShieldCheck, CheckCircle2, Hash } from "lucide-react";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (email: string, token: string, password: string) => Promise<{ error?: string }>;
  email: string;
}

export default function PasswordResetModal({ isOpen, onClose, onReset, email }: PasswordResetModalProps) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isOpen) {
      setToken("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen, email]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Ingresa el código que recibiste en tu correo.");
      return;
    }
    if (!password || password !== confirmPassword) {
      setError("Las contraseñas deben coincidir.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await onReset(email, token.trim(), password);
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
            <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Cambiar contraseña</h2>
            <p className="text-sm text-neutral-400 mt-2">Ingresá el código de seguridad que enviamos a tu correo electrónico.</p>
          </div>

          <div className="mb-4 rounded-2xl border border-neutral-800/70 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-300">
            <p><strong>Email:</strong> {email}</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-2xl border border-emerald-700/40 bg-emerald-950/30 px-4 py-4 text-sm text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Contraseña cambiada correctamente. Volvé a iniciar sesión.</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Código de seguridad</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  placeholder="Ej: f47ac10b-58cc..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Nueva contraseña</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  placeholder="Nueva contraseña"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token || !password || !confirmPassword || success}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
