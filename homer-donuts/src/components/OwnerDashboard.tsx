import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Order, DonutProduct } from "../types";
import { X, Lock, Unlock, CheckSquare, Square, Trash2, Phone, Calendar, ShoppingBag, TrendingUp, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { playPopSound, playSuccessSound } from "./SoundEffects";

interface OwnerDashboardProps {
  orders: Order[];
  donuts: DonutProduct[];
  onUpdateStock: (id: string, newStock: number) => void;
  onClose: () => void;
  onToggleCheckedOff: (id: string) => void;
  onUpdateStatus: (id: string, status: "Pendente" | "Preparando" | "Entregue") => void;
  onClearOrders: () => void;
}

export default function OwnerDashboard({
  orders,
  donuts,
  onUpdateStock,
  onClose,
  onToggleCheckedOff,
  onUpdateStatus,
  onClearOrders,
}: OwnerDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Filtering and sorting state
  const [filterStatus, setFilterStatus] = useState<"todos" | "pendente" | "preparando" | "entregue">("todos");
  const [hideCompleted, setHideCompleted] = useState(false);

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

  // Stats calculation
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter(o => o.checkedOff).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (hideCompleted && order.checkedOff) return false;
    if (filterStatus === "todos") return true;
    return order.status.toLowerCase() === filterStatus;
  });

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
                Acesso exclusivo para gerenciar pedidos e checklist de entrega.
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
                    autofocus
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
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👨‍🍳👑</div>
                  <div>
                    <h1 className="font-fredoka font-black text-2xl md:text-3xl text-choco-main uppercase leading-none">
                      Painel do Dono <span className="text-pink-primary font-mono text-sm">[Modo Gerente]</span>
                    </h1>
                    <p className="text-xs font-bold text-choco-light/70 uppercase tracking-wide mt-1">
                      Checklist e Controle das Encomendas de Donuts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playPopSound();
                      if (confirm("Tem certeza que deseja apagar o histórico de pedidos?")) {
                        onClearOrders();
                      }
                    }}
                    className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 border-2 border-red-500 text-red-700 py-2 px-4 rounded-xl text-xs font-bold transition-transform cursor-pointer"
                    title="Limpar todos os pedidos colocados"
                  >
                    <Trash2 size={14} />
                    Limpar Pedidos
                  </button>

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
            <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow flex flex-col gap-6">
              
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border-3 border-choco-main p-4 cartoon-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-choco-light uppercase block">Total de Pedidos</span>
                    <span className="text-3xl font-fredoka font-black text-choco-main">
                      {totalOrdersCount}
                    </span>
                  </div>
                  <ShoppingBag className="text-pink-primary" size={32} />
                </div>

                <div className="bg-white rounded-2xl border-3 border-choco-main p-4 cartoon-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-choco-light uppercase block">Faturado Estimado</span>
                    <span className="text-3xl font-fredoka font-black text-emerald-500">
                      R$ {totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <TrendingUp className="text-emerald-500" size={32} />
                </div>

                <div className="bg-white rounded-2xl border-3 border-choco-main p-4 cartoon-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-choco-light uppercase block font-fredoka">Status Atendimento</span>
                    <span className="text-xs font-bold text-choco-main block mt-1">
                      {completedOrdersCount} de {totalOrdersCount} concluídos ({totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 0}%)
                    </span>
                  </div>
                  <CheckCircle2 className="text-cyan-500" size={32} />
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div className="bg-cream-yellow/80 p-4 rounded-2xl border-3 border-choco-main flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter size={16} className="text-choco-main" />
                  <span className="text-xs font-bold text-choco-main uppercase mr-2">Filtrar por Status:</span>
                  
                  {/* Status buttons */}
                  {(["todos", "pendente", "preparando", "entregue"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        playPopSound();
                        setFilterStatus(status);
                      }}
                      className={`py-1 px-3.5 rounded-full text-[11px] font-mono font-bold uppercase border border-choco-main ${
                        filterStatus === status
                          ? "bg-pink-primary text-white"
                          : "bg-white text-choco-main hover:bg-cream-dark"
                      }`}
                    >
                      {status === "todos" ? "Todos os Pedidos" : status}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-choco-main uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideCompleted}
                    onChange={(e) => {
                      playPopSound();
                      setHideCompleted(e.target.checked);
                    }}
                    className="w-4 h-4 rounded border-choco-main text-pink-primary accent-pink-primary"
                  />
                  Ocultar concluídos
                </label>
              </div>

              {/* Layout Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Real-time Stock Manager Section */}
                <div className="lg:col-span-1 bg-white rounded-3xl border-3 border-choco-main p-6 cartoon-shadow-sm space-y-4">
                  <h3 className="font-fredoka font-black text-lg text-[#e13775] uppercase pb-2 border-b-2 border-choco-main/10 flex items-center gap-2">
                    <span>📦</span> Controle de Estoque
                  </h3>
                  <p className="text-xs font-bold text-choco-light leading-relaxed font-sans">
                    Defina e ajuste a quantidade em estoque de cada donut em tempo real. O estoque atualiza instantaneamente a cada venda no site! 🕒⚡
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {donuts.map((donut) => (
                      <div
                        key={donut.id}
                        className="bg-[#faf6eb]/70 rounded-2xl p-3 border-2 border-choco-main flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <img
                            src={donut.image}
                            alt={donut.name}
                            className="w-10 h-10 object-contain filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]"
                          />
                          <div className="min-w-0">
                            <h4 className="font-fredoka font-extrabold text-choco-main text-xs uppercase truncate">
                              {donut.name}
                            </h4>
                            <span className="text-[10px] font-black text-[#e13775] block">
                              R$ {donut.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Interactive stock stepper */}
                        <div className="flex items-center bg-white border border-choco-main/30 rounded-full p-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              onUpdateStock(donut.id, Math.max(0, donut.stock - 1));
                            }}
                            className="w-6 h-6 flex items-center justify-center bg-cream-yellow rounded-full border border-choco-main text-choco-main hover:bg-[#ffd166] active:scale-95 transition-all text-xs font-bold cursor-pointer"
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
                            className="w-8 text-center font-fredoka font-extrabold text-xs text-choco-main focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              onUpdateStock(donut.id, donut.stock + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center bg-cream-yellow rounded-full border border-choco-main text-choco-main hover:bg-[#ffd166] active:scale-95 transition-all text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Order Checklist List */}
                <div className="lg:col-span-2 flex flex-col">
                <h3 className="font-fredoka font-black text-lg text-rose-500 uppercase pb-2 mb-4 border-b-2 border-choco-main/10 flex items-center gap-2">
                  <span>📝</span> Lista de Pedidos (Checklist)
                </h3>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border-3 border-dashed border-choco-main/20 p-8">
                    <span className="text-5xl block mb-3 animate-bounce">🥐🍩</span>
                    <h4 className="text-xl font-fredoka font-bold text-choco-main">Nenhum pedido correspondente!</h4>
                    <p className="text-xs text-choco-light mt-1">
                      {totalOrdersCount === 0 
                        ? "Quando os clientes colocarem pedidos na bandeja, eles aparecerão automaticamente aqui." 
                        : "Experimente alterar seus filtros para visualizar outros pedidos."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`transition-all duration-300 relative bg-white border-3 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                          order.checkedOff
                            ? "border-emerald-300 bg-emerald-50/20 opacity-75"
                            : "border-choco-main"
                        }`}
                      >
                        {/* Quick checkbox check checklist bubble */}
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => {
                              playPopSound();
                              onToggleCheckedOff(order.id);
                            }}
                            className="shrink-0 text-choco-main mt-1 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                            title="Marcar como Concluído / Pronto"
                          >
                            {order.checkedOff ? (
                              <CheckSquare className="w-7 h-7 text-emerald-500" />
                            ) : (
                              <Square className="w-7 h-7" />
                            )}
                          </button>

                          {/* Order visual details */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="font-fredoka font-bold text-choco-main uppercase text-[15px]">
                                {order.customerName}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                #{order.id.slice(-5)}
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-cream-yellow px-2 py-0.5 rounded border border-choco-main text-choco-main flex items-center gap-1">
                                <Calendar size={10} />
                                {order.createdAt}
                              </span>
                            </div>

                            {/* Cart Items chosen */}
                            <div className="bg-cream-yellow/40 rounded-xl p-3 border border-choco-main/15 mb-3 inline-block min-w-[280px]">
                              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Itens solicitados:</p>
                              <ul className="space-y-1.5 text-xs font-bold text-choco-dark">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span className="text-pink-primary">🍩</span>
                                    <span>
                                      {item.quantity}x <strong className="uppercase font-fredoka">{item.donutName}</strong> (R$ 5.00 cada)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Client address & instructions */}
                            <div className="space-y-1 text-xs text-choco-light">
                              <p>
                                📍 <strong>Onde entregar:</strong> {order.customerAddress}
                              </p>
                              <p>
                                📞 <strong>Contato:</strong> {order.customerPhone}
                              </p>
                              <p className="font-extrabold text-pink-primary flex items-center gap-1 mt-1 font-mono uppercase bg-pink-50 border border-pink-200 rounded-lg p-1.5 w-max">
                                🕒 Hora da entrega: {order.deliveryTime === "Agora" ? "Agora! ⚡" : order.deliveryTime}
                              </p>
                              {order.notes && (
                                <p className="italic bg-yellow-50 px-2 py-1 rounded inline-block border border-yellow-200 mt-1 block w-max">
                                  💬 <strong>Obs:</strong> {order.notes}
                                </p>
                              )}
                              {order.couponApplied && (
                                <span className="text-[10px] font-bold text-pink-dark bg-pink-50 px-2 py-0.5 rounded border border-pink-200 mt-1 block w-max">
                                  🎟️ Cupom: {order.couponApplied}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order management actions on the right */}
                        <div className="flex flex-col justify-between items-end gap-3 self-stretch border-t md:border-t-0 md:border-l border-choco-main/10 pt-3 md:pt-0 md:pl-5 min-w-[140px]">
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-zinc-400 block">Total do Pedido</span>
                            <span className={`text-xl font-fredoka font-black ${order.checkedOff ? "text-emerald-500 line-through" : "text-[#e13775]"}`}>
                              R$ {order.total.toFixed(2)}
                            </span>
                          </div>

                          {/* Order Status Selectors */}
                          <div className="w-full">
                            <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Status de Preparo</span>
                            <div className="flex gap-1">
                              {(["Pendente", "Preparando", "Entregue"] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    playPopSound();
                                    onUpdateStatus(order.id, st);
                                  }}
                                  className={`flex-1 transition-all py-1 rounded-lg text-[9px] font-bold uppercase text-center border cursor-pointer ${
                                    order.status === st
                                      ? "bg-choco-main text-white border-choco-main"
                                      : "bg-white text-[#56493f] border-zinc-200 hover:border-choco-main"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick WhatsApp button */}
                          <button
                            onClick={() => {
                              playPopSound();
                              const formattedPhone = order.customerPhone.replace(/\D/g, "");
                              const message = `Olá ${order.customerName}! Recebemos o seu pedido de Donuts e já estamos separando na nossa cozinha! 🍩😋`;
                              window.open(`https://api.whatsapp.com/send?phone=55${formattedPhone}&text=${encodeURIComponent(message)}`, "_blank");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-1.5 px-3 border-2 border-choco-main font-fredoka font-bold text-[10px] uppercase flex items-center justify-center gap-1 w-full cursor-pointer"
                          >
                            <Phone size={11} /> Fale com Cliente
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
                </div> {/* Closing of lg:col-span-2 */}

              </div> {/* Closing of grid-cols-1 lg:grid-cols-3 */}

            </main>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
