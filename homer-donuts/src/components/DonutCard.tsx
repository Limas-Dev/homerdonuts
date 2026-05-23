import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DonutProduct } from "../types";
import { Star, Plus, Minus, ShoppingBag, Sparkles } from "lucide-react";
import { playCoinSound, playPopSound } from "./SoundEffects";

interface DonutCardProps {
  key?: string | number;
  donut: DonutProduct;
  onAddToCart: (donut: DonutProduct, qty: number) => void;
}

export default function DonutCard({ donut, onAddToCart }: DonutCardProps) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Increment item local volume
  const increment = () => {
    playPopSound();
    if (qty < donut.stock) {
      setQty((prev) => prev + 1);
    }
  };

  // Decrement item local volume
  const decrement = () => {
    playPopSound();
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  // Buy action
  const handleAdd = () => {
    const finalQty = donut.stock === 0 ? 0 : Math.max(1, Math.min(qty, donut.stock));
    if (finalQty <= 0) return;
    playCoinSound();
    onAddToCart(donut, finalQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const finalQty = donut.stock === 0 ? 0 : Math.max(1, Math.min(qty, donut.stock));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="relative bg-white cartoon-border-lg rounded-3xl p-5 cartoon-shadow-lg flex flex-col justify-between overflow-hidden z-10"
    >
      {/* Dynamic Badge */}
      <div className="absolute top-4 left-4 z-20">
        <span className={`px-4 py-1.5 rounded-full font-fredoka font-bold text-xs uppercase cartoon-border-sm cartoon-shadow-sm ${donut.badgeColor}`}>
          {donut.badge}
        </span>
      </div>

      {/* Rotating Main Donut Artwork Section */}
      <div className="relative h-56 flex items-center justify-center mt-3 group-hover:rotate-6 transition-transform">
        <div className="absolute w-36 h-36 bg-cream-dark/30 rounded-full blur-xl z-0" />
        <motion.img
          src={donut.image}
          alt={donut.name}
          referrerPolicy="no-referrer"
          className="w-48 h-48 object-contain z-10 transition-transform duration-500 hover:rotate-12 select-none filter drop-shadow-[0_12px_8px_rgba(55,30,15,0.25)]"
        />

        {/* Floating Sparkle when cursor flies over */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none top-8 left-8 text-yellow-400 animate-bounce">
          <Sparkles size={20} />
        </div>
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bottom-8 right-8 text-pink-sweet animate-pulse">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Text Details Area */}
      <div className="text-center mt-3 flex-grow">
        <h3 className="text-3xl font-fredoka font-extrabold text-choco-main tracking-normal uppercase cartoon-text-stroke">
          {donut.name}
        </h3>
        
        <div className="flex items-center justify-center gap-1.5 my-1.5">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(donut.rating) ? "fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-choco-light">
            {donut.rating.toFixed(1)} ({donut.ratingCount} reviews)
          </span>
        </div>

        <p className="text-sm text-choco-light leading-relaxed font-semibold italic min-h-[50px] px-2 mb-2">
          “{donut.description}”
        </p>

        {/* Dynamic Stock Badge */}
        <div className="flex justify-center items-center gap-1.5 mt-2 bg-cream-yellow/40 border-3 border-choco-main/10 rounded-xl px-3 py-1 bg-white inline-flex w-max mx-auto text-[11px] font-bold text-choco-main">
          <span>📦 Estoque:</span>
          {donut.stock > 0 ? (
            <span className="text-emerald-600 font-mono font-black">{donut.stock} un.</span>
          ) : (
            <span className="text-rose-500 font-mono font-black uppercase">Esgotado! 😭</span>
          )}
        </div>
      </div>

      {/* Pricing and Action Drawer */}
      <div className="mt-5 border-t border-dashed border-choco-main/20 pt-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-choco-light tracking-wide block">Preço Unitário</span>
            <span className="text-2xl font-fredoka font-extrabold text-[#e13775]">
              R$ {donut.price.toFixed(2)}
            </span>
          </div>

          {/* Amount stepper */}
          <div className="flex items-center bg-cream-yellow cartoon-border-sm rounded-full p-1 h-10">
            <button
              onClick={decrement}
              disabled={donut.stock <= 0}
              className={`w-7 h-7 flex items-center justify-center bg-white rounded-full border border-choco-main text-choco-main hover:bg-pink-100 transition-all font-bold ${donut.stock <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Minus size={13} />
            </button>
            <span className="w-8 text-center font-fredoka font-extrabold text-sm text-choco-main select-none">
              {finalQty}
            </span>
            <button
              onClick={increment}
              disabled={donut.stock <= 0}
              className={`w-7 h-7 flex items-center justify-center bg-white rounded-full border border-choco-main text-choco-main hover:bg-pink-100 transition-all font-bold ${donut.stock <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Master Buy Button */}
        <motion.button
          onClick={handleAdd}
          whileTap={donut.stock > 0 ? { scale: 0.95 } : {}}
          disabled={donut.stock <= 0}
          className={`w-full py-3 px-4 rounded-2xl font-fredoka font-extrabold text-sm uppercase tracking-wide cartoon-border-md cartoon-shadow-md flex items-center justify-center gap-2 text-white transition-all ${
            donut.stock <= 0
              ? "bg-zinc-400 border-zinc-500 text-zinc-200 cursor-not-allowed opacity-60"
              : justAdded
              ? "bg-emerald-500 cartoon-shadow-pink"
              : "bg-pink-primary hover:bg-pink-sweet active:top-1 cursor-pointer"
          }`}
        >
          {donut.stock <= 0 ? (
            <>Sem estoque 😭</>
          ) : justAdded ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              Adicionado! 💖
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              Adicionar {finalQty} ao Pedido {finalQty > 1 ? `(R$ ${(donut.price * finalQty).toFixed(2)})` : ""}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
