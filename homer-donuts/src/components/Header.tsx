import React, { useState } from "react";
import { motion } from "motion/react";
import { ShoppingBasket, Heart, Volume2, VolumeX, Sparkles, ChefHat } from "lucide-react";
import { playPopSound } from "./SoundEffects";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  favoritedCount: number;
  onFilterFavorites: () => void;
  isFilterActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Header({
  cartCount,
  onCartClick,
  favoritedCount,
  onFilterFavorites,
  isFilterActive,
  isMuted,
  onToggleMute,
}: HeaderProps) {
  const [logoRotating, setLogoRotating] = useState(false);

  const handleLogoClick = () => {
    playPopSound();
    setLogoRotating(true);
    setTimeout(() => setLogoRotating(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3 bg-[#faf6eb]/90 backdrop-blur-md border-b-4 border-choco-main select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
          <motion.div
            animate={logoRotating ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-4xl filter drop-shadow-[2px_2px_0px_#371e0f]"
          >
            🍩
          </motion.div>
          <div>
            <h1 className="font-fredoka font-extrabold text-2xl tracking-normal text-choco-main uppercase flex items-center gap-1.5 cartoon-text-stroke leading-tight">
              Homer <span className="text-pink-primary">Donuts</span>
            </h1>
            <p className="text-[10px] font-fredoka font-medium text-choco-light/80 block -mt-1 uppercase tracking-wider">
              Arcade Bakery & Donuts 🎮
            </p>
          </div>
        </div>

        {/* Action Widgets Menu */}
        <div className="flex items-center gap-3">
          
          {/* Sounds Toggle Widget */}
          <motion.button
            onClick={() => {
              // Toggle is hand-crafted with sounds
              onToggleMute();
              if (isMuted) {
                // Play pop when unmuting
                setTimeout(() => playPopSound(), 50);
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center justify-center p-2 rounded-full border-3 border-choco-main shadow-md transition-colors duration-200 cursor-pointer ${
              isMuted ? "bg-zinc-200 hover:bg-zinc-300" : "bg-yellow-300 hover:bg-yellow-400"
            }`}
            title={isMuted ? "Ativar som arcade" : "Mudar para mudo"}
          >
            {isMuted ? (
              <VolumeX size={18} className="text-zinc-600" />
            ) : (
              <Volume2 size={18} className="text-choco-main animate-pulse" />
            )}
          </motion.button>

          {/* Favorites Filter Indicator */}
          <motion.button
            onClick={() => {
              playPopSound();
              onFilterFavorites();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative py-1.5 px-3 rounded-full border-3 border-choco-main font-fredoka font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isFilterActive
                ? "bg-pink-primary text-white"
                : "bg-white text-choco-main hover:bg-pink-50"
            }`}
          >
            <Heart size={14} className={isFilterActive ? "fill-white" : "fill-current text-pink-primary"} />
            <span className="hidden sm:inline">Favoritos</span>
            {favoritedCount > 0 && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono leading-none border border-choco-main ${
                isFilterActive ? "bg-white text-pink-primary" : "bg-pink-primary text-white"
              }`}>
                {favoritedCount}
              </span>
            )}
          </motion.button>

          {/* Quick scroll to Chef ChefHat */}
          <button
            onClick={() => {
              playPopSound();
              const el = document.getElementById("catalog-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white/80 hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border-3 border-choco-main font-fredoka font-bold text-xs hover:bg-cream-dark transition-all scale-95 cursor-pointer"
          >
            <ChefHat size={14} />
            Catálogo
          </button>

          {/* Checkout Shopping Tray Counter */}
          <motion.button
            onClick={() => {
              playPopSound();
              onCartClick();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 bg-pink-primary hover:bg-[#ff85b0] text-white rounded-full border-3 border-choco-main cartoon-shadow-sm flex items-center justify-center relative cursor-pointer"
            title="Ver carrinho"
          >
            <ShoppingBasket size={20} className="filter drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)]" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0.3 }}
                animate={{ scale: [1, 1.3, 1] }}
                key={cartCount}
                className="absolute -top-1.5 -right-1.5 min-w-6 min-h-6 bg-yellow-400 text-choco-dark rounded-full font-fredoka font-extrabold text-[11px] leading-none border-2 border-choco-main flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

        </div>

      </div>
    </header>
  );
}
