import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DonutProduct } from "../types";
import { X, Lock } from "lucide-react";
import { playPopSound, playSuccessSound } from "./SoundEffects";

interface OwnerDashboardProps {
  donuts: DonutProduct[];
  onUpdateStock: (id: string, newStock: number) => void;
  onClose: () => void;
}

export default function OwnerDashboard({
  donuts,
  onUpdateStock,
  onClose,
}: OwnerDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const SECRET_PASSWORD = "5555";

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD || passwordInput.toLowerCase() === "dono") {
      playSuccessSound();
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      playPopSound();
      setLoginError("Senha incorreta! Tente '5555' ou 'dono' 🍩");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#faf6eb] flex flex-col min-h-screen">
      
      {/* AUTHENTICATION GATE */}
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-3xl cartoon-border-lg p-8 cartoon-shadow-xl text-center relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-300 rounded-full opacity-30 pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pink-primary rounded-full opacity-30 pointer-events-none" />

              <button
                onClick={() => {
                  playPopSound();
                  onClose();
                }}
                className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full border-2 border-choco-main cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-16 h-16 bg-pink-100 border-3 border-choco-main rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="text-pink-primary" size={32} />
              </div>

              <h2 className="text-3xl font-fredoka font-black text-choco-main uppercase tracking-normal mb-1">
                Área do Dono
              </h2>
              <p className="text-xs text-choco-light font-bold mb-6">
                Acesso exclusivo para controle de estoque de rosquinhas.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-choco-main uppercase block mb-1 text-left">
                    Senha Secreta
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite a senha..."
                    autoFocus
                    className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-3 px-4 text-center font-bold text-lg text-choco-main tracking-widest focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5 font-semibold">
                    Dica rápida: a senha padrão é <strong className="text-pink-primary">5555</strong> ou <strong className="text-pink-primary">dono</strong>
                  </p>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-lg animate-pulse">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-pink-primary hover:bg-pink-sweet text-white font-fredoka font-black py-3 rounded-xl cartoon-border-sm cartoon-shadow-sm uppercase text-sm cursor-pointer"
                >
                  Confirmar Identidade 🍩🗝️
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* OWNER CONTENT AREA */
          <motion.div
            key="owner-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col"
          >
            {/* Header */}
            <header className="bg-white border-b-4 border-choco-main p-4 md:px-8 shrink-0">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👨‍🍳👑</div>
                  <div>
                    <h1 className="font-fredoka font-black text-2xl md:text-3xl text-choco-main uppercase leading-none">
                      Painel do Dono <span className="text-pink-primary font-mono text-sm">[Estoque]</span>
                    </h1>
                    <p className="text-xs font-bold text-choco-light/70 uppercase tracking-wide mt-1">
                      Controle da Quantidade disponível para os clientes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playPopSound();
                      onClose();
                    }}
                    className="bg-choco-main hover:bg-choco-dark text-white font-fredoka font-black py-2 px-5 rounded-xl cartoon-border-sm cartoon-shadow-sm text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={15} />
                    Sair do Painel
                  </button>
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-4xl mx-auto w-full p-4 md:p-8 flex-grow flex flex-col gap-6 justify-center">
              
              {/* Real-time Stock Manager Card */}
              <div className="bg-white rounded-3xl border-3 border-choco-main p-6 md:p-8 cartoon-shadow-md space-y-6">
                <div>
                  <h3 className="font-fredoka font-black text-2xl text-[#e13775] uppercase pb-2 border-b-2 border-choco-main/10 flex items-center gap-2">
                    <span>📦</span> Controle de Estoque de Donuts
                  </h3>
                  <p className="text-xs font-bold text-choco-light leading-relaxed font-sans mt-2">
                    Defina e ajuste a quantidade em estoque para venda imediata. O estoque atualiza ou diminui de forma imediata e síncrona em todos os dispositivos sempre que você ou seus clientes atualizarem o site! 🕒⚡
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {donuts.map((donut) => (
                    <div
                      key={donut.id}
                      className="bg-[#faf6eb]/70 rounded-2xl p-4 border-2 border-choco-main flex flex-col items-center text-center gap-3"
                    >
                      <div className="relative group">
                        <img
                          src={donut.image}
                          alt={donut.name}
                          className="w-24 h-24 object-contain filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-fredoka font-extrabold text-choco-main text-base uppercase truncate">
                          {donut.name}
                        </h4>
                        <span className="text-xs font-black text-[#e13775] block mt-0.5">
                          R$ {donut.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Interactive stock stepper */}
                      <div className="flex items-center bg-white border border-choco-main/30 rounded-full p-1 shadow-sm mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            onUpdateStock(donut.id, Math.max(0, donut.stock - 1));
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-cream-yellow rounded-full border border-choco-main text-choco-main hover:bg-[#ffd166] active:scale-95 transition-all text-sm font-black cursor-pointer"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          value={donut.stock}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            onUpdateStock(donut.id, val);
                          }}
                          className="w-12 text-center font-fredoka font-black text-sm text-choco-main focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            onUpdateStock(donut.id, donut.stock + 1);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-cream-yellow rounded-full border border-choco-main text-choco-main hover:bg-[#ffd166] active:scale-95 transition-all text-sm font-black cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-emerald-800 leading-relaxed font-sans">
                  <span>✨</span>
                  <p>
                    <strong>Sincronização Ativa:</strong> As alterações feitas acima refletirão imediatamente na bandeja e no catálogo dos clientes, evitando vendas canceladas por falta de estoque.
                  </p>
                </div>
              </div>

            </main>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
