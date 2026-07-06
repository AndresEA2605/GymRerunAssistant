"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Lock, User, UserPlus, Loader2, Check } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegister: (email: string, username: string, password: string) => Promise<{ error?: string }>;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegister }: RegisterModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setTimeout(() => usernameRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError("El username debe tener entre 3 y 20 caracteres");
      return;
    }

    setLoading(true);
    const result = await onRegister(email, username, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 max-h-[95vh] overflow-y-auto">
        <div
          className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-700/50 shadow-[0_0_80px_rgba(16,185,129,0.08)] p-8 md:p-10 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all z-10">
            <span className="text-lg">×</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-18 h-18 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <UserPlus className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Crear Cuenta</h2>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">Registrate para guardar tu progreso<br />y sincronizar entre dispositivos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-800/50 rounded-2xl p-4 text-red-300 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl pl-12 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-neutral-600"
                  placeholder="TuNombre"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5 ml-1">Entre 3 y 20 caracteres</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl pl-12 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-neutral-600"
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
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl pl-12 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-neutral-600"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5 ml-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-neutral-800/80 border rounded-2xl pl-12 pr-12 py-3.5 text-white text-base focus:outline-none transition-all placeholder:text-neutral-600 ${
                    confirmPassword
                      ? passwordsMatch
                        ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                        : "border-red-500 focus:ring-2 focus:ring-red-500/30"
                      : "border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  }`}
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && (
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${passwordsMatch ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`} />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !username || !password || !confirmPassword}
              className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 text-base mt-1"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-neutral-800/50">
            <button onClick={onSwitchToLogin} className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors font-medium">
              ¿Ya tenés cuenta? <span className="font-bold text-emerald-400">Iniciá sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
