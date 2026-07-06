"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Lock, LogIn, Loader2, Sparkles } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setTimeout(() => emailRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEmail("");
      setPassword("");
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-700/50 shadow-[0_0_80px_rgba(99,102,241,0.08)] p-8 md:p-10 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
            <span className="text-lg">×</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-18 h-18 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <LogIn className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Iniciar Sesión</h2>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">Accedé a tu cuenta para sincronizar<br />tu progreso entre dispositivos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-800/50 rounded-2xl p-4 text-red-300 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl pl-12 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-neutral-600"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl pl-12 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-neutral-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-13 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 text-base mt-1"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-neutral-800/50">
            <button onClick={onSwitchToRegister} className="text-sm text-neutral-400 hover:text-indigo-400 transition-colors font-medium">
              ¿No tenés cuenta? <span className="font-bold text-indigo-400">Registrate</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
