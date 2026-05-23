import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, TIMELINE_STEPS } from "../types";
import { X, Trash2, ChevronRight, MapPin, Phone, User, ShoppingBag, Gift, Sparkles, MessageSquare, Play } from "lucide-react";
import { playPopSound, playSuccessSound } from "./SoundEffects";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (donutId: string, delta: number) => void;
  onRemoveItem: (donutId: string) => void;
  coupon: { text: string; discountType: string; amount: number } | null;
  onClearCart: () => void;
  onOrderSubmitted?: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryTime: string;
    notes?: string;
    items: { donutName: string; quantity: number }[];
    total: number;
    couponApplied?: string;
  }) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  coupon,
  onClearCart,
  onOrderSubmitted,
}: CartSidebarProps) {
  // Checkout Wizards States
  const [step, setStep] = useState<"cart" | "details" | "cooking">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"agora" | "especifico">("agora");
  const [deliveryTimeSpecified, setDeliveryTimeSpecified] = useState("");
  const [notes, setNotes] = useState("");
  const [cookingStep, setCookingStep] = useState(0);

  // Form Validation Errors
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string; deliveryTime?: string }>({});

  const shippingCost = 0;
  const subtotal = cart.reduce((acc, item) => acc + item.donut.price * item.quantity, 0);

  // Calculate discount amount
  let discountValue = 0;
  if (coupon) {
    if (coupon.discountType === "percent") {
      discountValue = (subtotal * coupon.amount) / 100;
    } else if (coupon.discountType === "fixed") {
      discountValue = coupon.amount;
    } else if (coupon.discountType === "free_donut" && subtotal >= 30) {
      discountValue = coupon.amount; // value of 1 free pink homer
    }
  }

  const finalTotal = Math.max(0, subtotal - discountValue + shippingCost);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "O nome é obrigatório!";
    if (!phone.trim()) newErrors.phone = "O número de telefone é obrigatório!";
    if (!address.trim()) newErrors.address = "O endereço de entrega é obrigatório!";
    if (deliveryOption === "especifico" && !deliveryTimeSpecified.trim()) {
      newErrors.deliveryTime = "Indique o horário desejado para a entrega fofinha!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startCookingSimulation = () => {
    if (!validateForm()) {
      playPopSound();
      return;
    }
    
    const finalDeliveryTime = deliveryOption === "agora" ? "Agora" : deliveryTimeSpecified;

    // Call order submission callback so parent App records the order
    if (onOrderSubmitted) {
      onOrderSubmitted({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        deliveryTime: finalDeliveryTime,
        notes: notes || undefined,
        items: cart.map((c) => ({
          donutName: c.donut.name,
          quantity: c.quantity,
        })),
        total: finalTotal,
        couponApplied: coupon?.text || undefined,
      });
    }

    playPopSound();
    setStep("cooking");
    setCookingStep(0);

    // Increment simulated cooking steps
    const timer = setInterval(() => {
      setCookingStep((prev) => {
        if (prev >= TIMELINE_STEPS.length - 1) {
          clearInterval(timer);
          playSuccessSound();
          return prev + 1; // Completed
        }
        playPopSound();
        return prev + 1;
      });
    }, 2800);
  };

  // Compose and trigger WhatsApp Redirect
  const triggerWhatsAppRedirect = () => {
    playPopSound();
    
    // Create cart list summary text
    let cartListText = "";
    cart.forEach((item) => {
      cartListText += `• ${item.quantity}x Donut ${item.donut.name} (R$ ${(item.donut.price * item.quantity).toFixed(2)})\n`;
    });

    const wonDiscountText = coupon 
      ? `\n🎟️ *Cupom aplicado:* ${coupon.text} (-R$ ${discountValue.toFixed(2)})` 
      : "";

    const finalDeliveryTime = deliveryOption === "agora" ? "Agora fofinho! ⚡" : deliveryTimeSpecified;

    const message = `Olá! Gostaria de fazer um pedido na Homer Donuts 🍩✨

👤 *Dados do Cliente:*
• *Nome:* ${name}
• *Número/WhatsApp:* ${phone}
• *Onde entregar:* ${address}
• *Hora da entrega:* ${finalDeliveryTime}
${notes ? `• *Observações:* ${notes}\n` : ""}
🛒 *Donuts Escolhidos:*
${cartListText}${wonDiscountText}
🛵 *Taxa de Entrega:* GRÁTIS! 🎉
💰 *Valor Total:* R$ ${finalTotal.toFixed(2)}

_Enviado de forma rápida a partir do site interativo Homer Donuts!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=85263478234&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToCart = () => {
    playPopSound();
    setStep("cart");
  };

  const handleGoToDetails = () => {
    playPopSound();
    if (cart.length === 0) return;
    setStep("details");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-choco-dark/60 z-40 cursor-pointer backdrop-blur-xs"
          />

          {/* Sliding Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-[#faf6eb] border-l-6 border-choco-main z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header section with bouncing logo */}
            <div className="bg-pink-primary text-white cartoon-border-sm rounded-b-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🍩</span>
                <div>
                  <h3 className="font-fredoka font-extrabold text-2xl uppercase tracking-wider text-cream-yellow pr-1 cartoon-text-stroke">
                    Bandeja Doce
                  </h3>
                  <p className="text-[10px] font-mono tracking-wide text-pink-100 uppercase">
                    Homer Donuts Express
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="bg-choco-main hover:bg-choco-dark text-white p-2 rounded-full cartoon-border-sm shadow-md transition-transform active:scale-90 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrolling Core Content Panel */}
            <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
              
              {/* Checkout Progress Guide (Horizontal Step Bubbles) */}
              <div className="flex items-center justify-around bg-cream-yellow/80 p-3 rounded-2xl border-4 border-dashed border-choco-main/20 mb-4 text-xs font-bold text-choco-main">
                <span className={`px-2 py-1 rounded-lg ${step === "cart" ? "bg-pink-primary text-white" : "bg-white/50"}`}>
                  1. Bandeja 🧺
                </span>
                <ChevronRight size={14} className="text-choco-light/40" />
                <span className={`px-2 py-1 rounded-lg ${step === "details" ? "bg-pink-primary text-white" : "bg-white/50"}`}>
                  2. Entrega 🛵
                </span>
                <ChevronRight size={14} className="text-choco-light/40" />
                <span className={`px-2 py-1 rounded-lg ${step === "cooking" ? "bg-emerald-500 text-white" : "bg-white/50"}`}>
                  3. Preparo 🧑‍🍳
                </span>
              </div>

              {/* STEP 1: CART LIST SHOWN */}
              {step === "cart" && (
                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <span className="text-6xl inline-block rotate-12 mb-4 animate-bounce-gentle">🔍🍩</span>
                      <h4 className="text-xl font-fredoka font-bold text-choco-main">Sua bandeja está vazia!</h4>
                      <p className="text-xs text-choco-light mt-2 max-w-xs mx-auto">
                        Corra lá no catálogo principal para arrastar as rosquinhas mais crocantes e fofinhas pra cá!
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 bg-pink-primary text-white font-fredoka font-bold py-2 px-6 rounded-full cartoon-border-sm cartoon-shadow-sm hover:scale-105 cursor-pointer"
                      >
                        Encontrar Donuts 🍩
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <motion.div
                        key={item.donut.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-white p-3 rounded-2xl border-3 border-choco-main cartoon-shadow-md flex items-center justify-between relative"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.donut.image}
                            alt={item.donut.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-contain filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] bg-cream-yellow/80 p-1.5 rounded-full"
                          />
                          <div>
                            <h4 className="font-fredoka font-bold text-choco-main text-lg leading-tight uppercase">
                              {item.donut.name}
                            </h4>
                            <span className="text-xs font-extrabold text-[#e13775] block mt-0.5">
                              R$ {item.donut.price.toFixed(2)} total
                            </span>
                          </div>
                        </div>

                        {/* Qty update buttons */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-cream-yellow/85 rounded-full p-0.5 border border-choco-main">
                            <button
                              onClick={() => {
                                playPopSound();
                                if (item.quantity === 1) {
                                  onRemoveItem(item.donut.id);
                                } else {
                                  onUpdateQty(item.donut.id, -1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-full font-bold text-choco-main border hover:bg-pink-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-fredoka font-bold text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                playPopSound();
                                onUpdateQty(item.donut.id, 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-full font-bold text-choco-main border hover:bg-pink-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              playPopSound();
                              onRemoveItem(item.donut.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Coupon Notice in Tray */}
                  {coupon && cart.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-100 p-3 rounded-2xl border-2 border-dashed border-amber-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Gift className="text-amber-600 animate-bounce" size={20} />
                        <div>
                          <span className="text-xs font-bold text-amber-950 block">Cupom da Roleta Ativo!</span>
                          <span className="text-[11px] font-fredoka text-amber-800">{coupon.text}</span>
                        </div>
                      </div>
                      <span className="bg-amber-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Prêmio! 🎁
                      </span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 2: ADDRESS & CLIENT DETAILS FORM */}
              {step === "details" && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border-3 border-choco-main cartoon-shadow-sm space-y-4">
                    <h4 className="font-fredoka font-bold text-lg text-choco-main border-b border-choco-main/10 pb-2 flex items-center gap-2 uppercase">
                      <User size={18} className="text-pink-primary" /> Dados do Pedido
                    </h4>

                    {/* Name block */}
                    <div>
                      <label className="text-xs font-bold text-choco-main uppercase block mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome fofinho"
                        className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-choco-main placeholder:text-choco-light/40"
                      />
                      {errors.name && <span className="text-[10px] text-pink-dark font-bold mt-0.5 block">{errors.name}</span>}
                    </div>

                    {/* Phone block */}
                    <div>
                      <label className="text-xs font-bold text-choco-main uppercase block mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="WhatsApp (ex: 84 99999-9999)"
                        className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-choco-main placeholder:text-choco-light/40"
                      />
                      {errors.phone && <span className="text-[10px] text-pink-dark font-bold mt-0.5 block">{errors.phone}</span>}
                    </div>

                    {/* Address block */}
                    <div>
                      <label className="text-xs font-bold text-choco-main uppercase block mb-1">
                        Onde entregar *
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Endereço de entrega completo"
                        rows={2}
                        className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-choco-main placeholder:text-choco-light/40 resize-none"
                      />
                      {errors.address && <span className="text-[10px] text-pink-dark font-bold mt-0.5 block">{errors.address}</span>}
                    </div>

                    {/* Delivery Time block */}
                    <div>
                      <label className="text-xs font-bold text-choco-main uppercase block mb-2">
                        Hora da entrega *
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setDeliveryOption("agora");
                          }}
                          className={`py-2 px-3 rounded-xl border-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            deliveryOption === "agora"
                              ? "bg-pink-primary border-choco-main text-white"
                              : "bg-[#faf6eb] border-zinc-200 text-choco-main hover:bg-cream-dark"
                          }`}
                        >
                          ⚡ Agora
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setDeliveryOption("especifico");
                          }}
                          className={`py-2 px-3 rounded-xl border-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            deliveryOption === "especifico"
                              ? "bg-pink-primary border-choco-main text-white"
                              : "bg-[#faf6eb] border-zinc-200 text-choco-main hover:bg-cream-dark"
                          }`}
                        >
                          🕒 Escolher Horário
                        </button>
                      </div>

                      {deliveryOption === "especifico" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2"
                        >
                          <input
                            type="text"
                            value={deliveryTimeSpecified}
                            onChange={(e) => setDeliveryTimeSpecified(e.target.value)}
                            placeholder="Ex: 15h30, Às 19:00"
                            className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-choco-main placeholder:text-choco-light/40"
                          />
                          {errors.deliveryTime && (
                            <span className="text-[10px] text-pink-dark font-bold mt-0.5 block">
                              {errors.deliveryTime}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleBackToCart}
                    className="text-xs font-fredoka font-bold text-choco-light hover:text-pink-primary flex items-center gap-1 cursor-pointer"
                  >
                    ← Voltar para a Bandeja
                  </button>
                </div>
              )}

              {/* STEP 3: MOCK COOKING SIMULATION / THE MINI-GAME */}
              {step === "cooking" && (
                <div className="space-y-5 text-center">
                  <div className="bg-white p-5 rounded-2xl border-4 border-choco-main cartoon-shadow-md">
                    <h4 className="font-fredoka font-extrabold text-2xl text-choco-main mb-2 uppercase cartoon-text-stroke">
                      Cozinha em Ação! 🧑‍🍳
                    </h4>
                    <p className="text-xs text-choco-light">
                      Nossa equipe de coelhos donuts está esticando a massa, dourando com amor e confeitando milimetricamente seu pedido! Olha o progresso:
                    </p>

                    {/* Highly Visual Progression Timeline Slider */}
                    <div className="my-6 space-y-4 relative">
                      {TIMELINE_STEPS.map((tStep, idx) => {
                        const isActive = cookingStep >= idx;
                        const isCurrent = cookingStep === idx;

                        return (
                          <div key={idx} className="flex items-center gap-3 text-left">
                            {/* Bouncy Indicator Circle */}
                            <div className="relative">
                              <span
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-fredoka font-bold text-lg cartoon-border-sm transition-all shadow-md ${
                                  isActive
                                    ? `${tStep.color} text-choco-dark scale-110`
                                    : "bg-gray-100 text-zinc-400"
                                }`}
                              >
                                {isCurrent ? "🔥" : idx + 1}
                              </span>
                              {isActive && idx < TIMELINE_STEPS.length - 1 && (
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1 h-4 bg-choco-main" />
                              )}
                            </div>

                            <div className="flex-grow">
                              <h5 className={`font-fredoka font-extrabold text-sm uppercase ${
                                isActive ? "text-choco-main text-[15px]" : "text-zinc-400"
                              }`}>
                                {tStep.label}
                                {isCurrent && <span className="ml-2 text-xs animate-ping">●</span>}
                              </h5>
                              <p className="text-[10px] text-choco-light font-medium">{tStep.desc}</p>
                            </div>

                            {/* Completed checkmark */}
                            {cookingStep > idx && (
                              <span className="text-emerald-500 font-bold font-fredoka text-xs">OK ✔</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar overall bottom */}
                    <div className="relative w-full h-4 bg-choco-dark/15 rounded-full overflow-hidden border border-choco-main">
                      <motion.div
                        className="absolute top-0 left-0 bottom-0 bg-pink-primary"
                        animate={{ width: `${(Math.min(cookingStep, TIMELINE_STEPS.length) / TIMELINE_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {cookingStep >= TIMELINE_STEPS.length ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-emerald-100 p-4 rounded-xl border-3 border-emerald-500 cartoon-shadow-sm">
                        <span className="text-4xl animate-bounce inline-block">🚀🎉</span>
                        <h5 className="font-fredoka font-bold text-emerald-950 mt-2 text-lg">
                          DONUTS COZIDOS COM SUCESSO!
                        </h5>
                        <p className="text-[11px] text-emerald-800 leading-tight">
                          Agora é só disparar a mensagem direta para o WhatsApp para formalizarmos sua entrega. Clique no botão gigante abaixo e devore!
                        </p>
                      </div>

                      <button
                        onClick={triggerWhatsAppRedirect}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-fredoka font-extrabold py-4 px-6 rounded-2xl cartoon-border-md cartoon-shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg cursor-pointer"
                      >
                        <MessageSquare className="animate-pulse" size={22} />
                        Enviar no WhatsApp! 🍩💬
                      </button>

                      <button
                        onClick={() => {
                          playPopSound();
                          onClearCart();
                          setStep("cart");
                          onClose();
                        }}
                        className="text-xs font-fredoka text-choco-light hover:text-pink-primary underline cursor-pointer"
                      >
                        Limpar Bandeja e Recomeçar 🛒
                      </button>
                    </motion.div>
                  ) : (
                    <div className="p-4 bg-cream-yellow/80 rounded-xl border border-dashed border-choco-main/20 flex flex-col items-center justify-center">
                      <div className="loader border-4 border-t-pink-primary rounded-full w-8 h-8 animate-spin border-choco-main" />
                      <span className="text-xs font-bold text-choco-main mt-2 block">Cozinhando... Guenta aí! 🥯⚡</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart footer drawer totals / checkout activation */}
            {step !== "cooking" && cart.length > 0 && (
              <div className="bg-white border-t-4 border-choco-main p-4 space-y-3 z-10 shadow-lg select-none">
                <div className="space-y-1.5 text-xs font-bold text-choco-main">
                  <div className="flex justify-between">
                    <span className="text-choco-light">Subtotal dos Donuts:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-pink-dark">
                      <span>Prêmio Aplicado:</span>
                      <span>-R$ {discountValue.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-choco-light">Taxa de Entrega:</span>
                    <span>GRÁTIS! 🛵🎉</span>
                  </div>

                  <div className="flex justify-between items-end border-t border-choco-main/10 pt-3 mt-1.5">
                    <span className="font-fredoka text-base text-choco-main uppercase">Valor Total do Pedido:</span>
                    <span className="font-fredoka text-2xl font-extrabold text-[#e13775]">
                      R$ {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Confirm step bottom actions */}
                {step === "cart" ? (
                  <button
                    onClick={handleGoToDetails}
                    className="w-full bg-pink-primary hover:bg-pink-sweet text-white font-fredoka font-extrabold py-3.5 px-4 rounded-2xl cartoon-border-md cartoon-shadow-md flex items-center justify-center gap-2 uppercase tracking-wider text-sm transition-transform active:translate-y-1 shadow-md cursor-pointer"
                  >
                    <span>Finalizar Pedido</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={startCookingSimulation}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-fredoka font-extrabold py-3.5 px-4 rounded-2xl cartoon-border-md cartoon-shadow-md flex items-center justify-center gap-2 uppercase tracking-wider text-sm transition-transform active:translate-y-1 shadow-md cursor-pointer"
                  >
                    <Play size={18} className="fill-current" />
                    <span>Colocar para Cozinhar! 🧑‍🍳🔥</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
