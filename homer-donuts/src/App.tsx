import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CartItem,
  DONUTS_DATA,
  REVIEWS_DATA,
  DonutProduct,
  Review,
  Order
} from "./types";
import {
  playPopSound,
  playCoinSound,
  playSuccessSound,
  playFavoritedSound,
  setMutedStatus,
  getMutedStatus
} from "./components/SoundEffects";
import Header from "./components/Header";
import DonutCard from "./components/DonutCard";
import CartSidebar from "./components/CartSidebar";
import FloatingDonuts from "./components/FloatingDonuts";
import OwnerDashboard from "./components/OwnerDashboard";
import {
  Sparkles,
  ShoppingBag,
  Star,
  Check,
  ChevronDown,
  Gift,
  Heart,
  Cookie,
  Bike,
  Smile,
  ArrowRight,
  MessageSquare
} from "lucide-react";

// Cute custom avatars for custom customer reviews
const REVIEW_AVATARS = [
  { id: "donut", emoji: "🍩", label: "Rosquinha Gamer" },
  { id: "unicorn", emoji: "🦄", label: "Unicórnio Doce" },
  { id: "cat", emoji: "😺", label: "Gatinho Glaze" },
  { id: "bear", emoji: "🧸", label: "Urso Açucarado" },
  { id: "alien", emoji: "👾", label: "Alien de Morango" },
  { id: "agent", emoji: "🕵️‍♂️", label: "Agente Secreto do Recheio" }
];

export default function App() {
  // Master states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("donut_favs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [wonCoupon, setWonCoupon] = useState<{ text: string; discountType: string; amount: number } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [donuts, setDonuts] = useState<DonutProduct[]>(() => {
    try {
      const stored = localStorage.getItem("donut_products_stock");
      if (stored) {
        const parsed = JSON.parse(stored) as DonutProduct[];
        return DONUTS_DATA.map((defaultDonut) => {
          const storedDonut = parsed.find((p) => p.id === defaultDonut.id);
          return storedDonut ? { ...defaultDonut, stock: storedDonut.stock } : defaultDonut;
        });
      }
    } catch {
      // safe fallback
    }
    return DONUTS_DATA;
  });

  // Sync donuts with stock to storage
  useEffect(() => {
    localStorage.setItem("donut_products_stock", JSON.stringify(donuts));
  }, [donuts]);

  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  
  // Admin / Owner checklist states
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("donut_admin_orders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync administrative orders to storage
  useEffect(() => {
    localStorage.setItem("donut_admin_orders", JSON.stringify(orders));
  }, [orders]);

  // New review form states
  const [newAuthor, setNewAuthor] = useState("");
  const [newAvatar, setNewAvatar] = useState("🍩");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newDonutId, setNewDonutId] = useState("pink-homer");

  // Cartoon Toast Notifications
  const [toasts, setToasts] = useState<{ id: string; text: string; emoji: string }[]>([]);

  // Sound Context Muting sync
  useEffect(() => {
    setMutedStatus(isMuted);
  }, [isMuted]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem("donut_favs", JSON.stringify(favorites));
  }, [favorites]);

  // Fire a bouncy cartoon toast
  const fireToast = (text: string, emoji = "🍩") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, text, emoji }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Add items to standard cart state
  const handleAddToCart = (product: DonutProduct, qty: number) => {
    const activeDonut = donuts.find((d) => d.id === product.id) || product;
    if (activeDonut.stock <= 0) {
      fireToast(`Desculpe, o donut ${product.name} está sem estoque! 😭`, "⚠️");
      return;
    }

    let allowedQty = qty;

    setCart((prev) => {
      const existing = prev.find((item) => item.donut.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const totalRequested = currentQtyInCart + qty;
      
      if (totalRequested > activeDonut.stock) {
        allowedQty = activeDonut.stock - currentQtyInCart;
        if (allowedQty <= 0) {
          fireToast(`Você já tem todo o estoque de ${product.name} na sua bandeja! 📦`, "⚠️");
          return prev;
        }
        fireToast(`Apenas adicionamos ${allowedQty}x ${product.name} (limite do estoque atingido)! 📦`, "⚠️");
      } else {
        fireToast(`${qty}x ${product.name} adicionado à sua bandeja!`, "🛒");
      }
      
      if (existing) {
        return prev.map((item) =>
          item.donut.id === product.id
            ? { ...item, quantity: item.quantity + allowedQty }
            : item
        );
      }
      return [...prev, { donut: activeDonut, quantity: allowedQty }];
    });
  };

  // Stepper updates inside checkout drawer
  const handleUpdateCartQty = (donutId: string, delta: number) => {
    const activeDonut = donuts.find((d) => d.id === donutId);
    if (!activeDonut) return;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.donut.id === donutId) {
            const nextQty = item.quantity + delta;
            if (nextQty > activeDonut.stock) {
              fireToast(`Desculpe, temos apenas ${activeDonut.stock} un. em estoque! 😭`, "⚠️");
              return { ...item, quantity: activeDonut.stock };
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Delete item from cart
  const handleRemoveCartItem = (donutId: string) => {
    const item = cart.find((i) => i.donut.id === donutId);
    if (item) {
      setCart((prev) => prev.filter((i) => i.donut.id !== donutId));
      fireToast(`${item.donut.name} removido da bandeja.`, "🗑️");
    }
  };

  // Clean whole shopping array
  const handleClearCart = () => {
    setCart([]);
    fireToast("Sua bandeja foi limpa para uma nova fornada!", "🧼");
  };

  // Add new order placed by visitor
  const handleOrderSubmitted = (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryTime: string;
    notes?: string;
    items: { donutName: string; quantity: number }[];
    total: number;
    couponApplied?: string;
  }) => {
    const newOrder: Order = {
      id: "PEDIDO-" + Math.floor(1000 + Math.random() * 9000),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      deliveryTime: orderData.deliveryTime,
      notes: orderData.notes,
      items: orderData.items,
      total: orderData.total,
      couponApplied: orderData.couponApplied,
      status: "Pendente",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      checkedOff: false,
    };
    setOrders((prev) => [newOrder, ...prev]);
    
    // Decrease stock levels based on the submitted order's items
    setDonuts((prevDonuts) =>
      prevDonuts.map((d) => {
        const itemOrdered = orderData.items.find(
          (it) => it.donutName.toLowerCase() === d.name.toLowerCase()
        );
        if (itemOrdered) {
          return {
            ...d,
            stock: Math.max(0, d.stock - itemOrdered.quantity),
          };
        }
        return d;
      })
    );
  };

  // Heart trigger
  const handleToggleFavorite = (donutId: string) => {
    const wasFav = favorites.includes(donutId);
    if (wasFav) {
      setFavorites((prev) => prev.filter((id) => id !== donutId));
      fireToast("Removido dos favoritos", "💔");
    } else {
      setFavorites((prev) => [...prev, donutId]);
      fireToast("Adicionado aos favoritos de açúcar! 💖", "❤️");
    }
  };

  // Direct Win registration from Spin Wheel callback
  const handleWinCoupon = (coupon: { text: string; discountType: string; amount: number }) => {
    setWonCoupon(coupon);
    fireToast(`Você ganhou: ${coupon.text}!`, "🎁");
  };

  // Action Submit Custom review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      playPopSound();
      fireToast("Preencha todos os campos da avaliação!", "⚠️");
      return;
    }

    playSuccessSound();
    const addedReview: Review = {
      id: Math.random().toString(),
      author: newAuthor,
      avatar: newAvatar,
      role: "Membro Honorário da Gula",
      comment: newComment,
      rating: newRating,
      donutId: newDonutId,
      date: "Agora mesmo"
    };

    setReviews((prev) => [addedReview, ...prev]);

    // Recalculate average rating of associated donut
    setDonuts((prevDonuts) =>
      prevDonuts.map((d) => {
        if (d.id === newDonutId) {
          const currentTotalStars = d.rating * d.ratingCount;
          const newCount = d.ratingCount + 1;
          const newAvg = (currentTotalStars + newRating) / newCount;
          return {
            ...d,
            ratingCount: newCount,
            rating: Math.min(5.0, Number(newAvg.toFixed(2)))
          };
        }
        return d;
      })
    );

    // Clear form
    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    fireToast("Sua avaliação açucarada foi publicada! ⭐", "📝");
  };

  // Filtering Donuts based on favorite state
  const displayedDonuts = filterFavoritesOnly
    ? donuts.filter((d) => favorites.includes(d.id))
    : donuts;

  return (
    <div className="min-h-screen bg-[#faf6eb] pb-20 relative select-none">
      
      {/* Dynamic drifting background particles */}
      <FloatingDonuts />

      {/* Styled Header Component with mute and basket states */}
      <Header
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => {
          playPopSound();
          setIsCartOpen(true);
        }}
        favoritedCount={favorites.length}
        onFilterFavorites={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
        isFilterActive={filterFavoritesOnly}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Hero Section Banner */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden text-center select-none z-10 mt-2">
        <div className="absolute inset-0 bg-radial from-pink-sweet/20 to-transparent pointer-events-none z-0" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* Slogan badge with micro-animation */}
          <motion.div
            initial={{ scale: 0.8, rotate: -2 }}
            animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block bg-yellow-300 text-choco-main font-fredoka font-extrabold text-sm uppercase cartoon-border-sm cartoon-shadow-sm py-1.5 px-5 rounded-full mb-6"
          >
            Os donuts mais absurdamente gostosos da cidade! 🍩✨
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-fredoka font-extrabold text-choco-main tracking-normal text-center cartoon-text-stroke-lg uppercase leading-none mb-4">
            QUALQUER FORMA, FOFURA E <span className="text-pink-primary">SAUDADE</span>
          </h2>

          <p className="text-sm md:text-base text-choco-light font-bold max-w-xl mx-auto mb-8 leading-relaxed">
            Esqueça receitas sem graça! Aqui, nós fritamos obras de arte recheadas até as bordas com diversão, magia e uma avalanche de glicose estilosa. 🎮😋
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playPopSound();
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-pink-primary hover:bg-pink-sweet text-white font-fredoka font-extrabold text-lg uppercase tracking-wider py-4 px-10 rounded-2xl cartoon-border-md cartoon-shadow-lg flex items-center justify-center gap-3 cursor-pointer group"
            >
              <ShoppingBag size={22} className="group-hover:animate-bounce" />
              Pedir Agora!
            </motion.button>
          </div>
        </div>
      </section>



      {/* Main Catalog / Donuts Section */}
      <section id="catalog-section" className="py-12 px-4 max-w-7xl mx-auto z-10 relative">
        
        <div className="flex flex-col md:flex-row items-center justify-between border-b-4 border-dashed border-choco-main/20 pb-5 mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-fredoka font-black text-choco-main uppercase tracking-normal cartoon-text-stroke text-center md:text-left">
              🍩 O Cardápio dos Sonhos
            </h2>
            <p className="text-xs text-choco-light font-semibold block text-center md:text-left mt-1">
              {filterFavoritesOnly
                ? "Mostrando seus queridinhos do coração ❤️"
                : "Clique, gire e prepare seu estômago para a melhor experiência!"}
            </p>
          </div>

          {filterFavoritesOnly && (
            <button
              onClick={() => {
                playPopSound();
                setFilterFavoritesOnly(false);
              }}
              className="mt-4 md:mt-0 bg-zinc-200 text-zinc-800 text-xs font-fredoka font-bold py-1.5 px-4 rounded-full cartoon-border-sm hover:bg-zinc-300"
            >
              Mostrar Todos os Donuts 🥯
            </button>
          )}
        </div>

        {/* Empty Search Handler */}
        {displayedDonuts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl cartoon-border-md p-8 shadow-inner">
            <span className="text-6xl block mb-4 animate-bounce">💔</span>
            <h4 className="text-2xl font-fredoka font-bold text-choco-main">Nenhum favorito selecionado!</h4>
            <p className="text-xs text-choco-light mt-1">
              Adicione corações ❤️ nos donuts para que fiquem filtrados nesta tela.
            </p>
            <button
              onClick={() => {
                playPopSound();
                setFilterFavoritesOnly(false);
              }}
              className="mt-6 bg-pink-primary text-white font-fredoka font-bold py-2.5 px-6 rounded-xl cartoon-border-sm"
            >
              Ir ao Cardápio Geral
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedDonuts.map((donut) => (
              <DonutCard
                key={donut.id}
                donut={donut}
                onAddToCart={handleAddToCart}
                isFavorite={favorites.includes(donut.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* About Section - "Criamos donuts tradicionais fofinhos e saborosos." */}
      <section className="py-12 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="bg-cream-yellow cartoon-border-lg rounded-3xl p-6 md:p-10 cartoon-shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          
          <div className="max-w-md">
            <span className="bg-pink-primary text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase cartoon-border-sm">
              Nossa Padaria Tradicional 🍩
            </span>
            <h3 className="font-fredoka font-extrabold text-3xl md:text-4xl text-choco-main uppercase mt-4 leading-tight cartoon-text-stroke">
              “Donuts fresquinhos feitos todos os dias com carinho!”
            </h3>
            <p className="text-xs text-choco-light leading-relaxed font-semibold mt-3">
              Nossa produção diária foca na fofura perfeita da massa e na generosa quantidade de cobertura tradicional. Usamos ingredientes selecionados e técnicas clássicas de fermentação natural para garantir que cada mordida seja macia e saborosa.
            </p>
            <p className="text-xs text-choco-light leading-relaxed font-semibold mt-2 border-t border-choco-main/10 pt-2 italic">
              Não economizamos nos recheios tradicionais. É a receita perfeita para quem ama um bom doce clássico acompanhado de um café quentinho! ☕🍩
            </p>

            <div className="grid grid-cols-3 gap-2 mt-6 text-center">
              <div className="bg-white p-2 rounded-xl border border-choco-main">
                <span className="text-lg block">🌾</span>
                <span className="text-[10px] font-fredoka font-bold text-choco-main uppercase">Massa Fresca</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-choco-main">
                <span className="text-lg block">🧁</span>
                <span className="text-[10px] font-fredoka font-bold text-choco-main uppercase">Feito no Dia</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-choco-main">
                <span className="text-lg block">🛵</span>
                <span className="text-[10px] font-fredoka font-bold text-choco-main uppercase">Entrega Rápida</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-56 h-56 rounded-full bg-pink-primary/20 absolute -inset-3 blur-md animate-pulse" />
            <div className="w-56 h-56 bg-white rounded-full cartoon-border-lg cartoon-shadow-md overflow-hidden flex items-center justify-center relative">
              <span className="text-8xl select-none animate-bounce-gentle inline-block">🍩☕</span>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-300 px-3 py-0.5 rounded-full border border-choco-main font-fredoka font-bold text-[10px] text-choco-main uppercase tracking-wider">
                100% Caseiro
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* User Reviews and Interactive Form */}
      <section className="py-12 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-fredoka font-black text-choco-main uppercase cartoon-text-stroke">
            ⭐ Inspeção da Polícia do Sabor
          </h2>
          <p className="text-xs text-choco-light font-bold">
            Escreva você também sua avaliação épica e nos ajude a fritar melhor!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Form to submit review */}
          <div className="bg-white rounded-3xl p-5 cartoon-border-lg cartoon-shadow-md h-fit">
            <h3 className="font-fredoka font-bold text-lg text-rose-500 uppercase pb-2 mb-4 border-b border-choco-main/10 flex items-center gap-1.5">
              <Cookie size={18} /> Sua Avaliação
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Author name */}
              <div>
                <label className="text-xs font-bold text-choco-main uppercase block mb-1">Seu Nome / Apelido</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Nome fofinho"
                  className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                />
              </div>

              {/* Avatar Picker list */}
              <div>
                <label className="text-xs font-bold text-choco-main uppercase block mb-1">Escolha seu Avatar</label>
                <div className="grid grid-cols-3 gap-2">
                  {REVIEW_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setNewAvatar(av.emoji);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-center border-2 text-sm flex flex-col items-center justify-center transition-all cursor-pointer ${
                        newAvatar === av.emoji
                          ? "bg-pink-100 border-pink-primary scale-105"
                          : "bg-white border-zinc-200 hover:border-choco-main/40"
                      }`}
                    >
                      <span className="text-xl">{av.emoji}</span>
                      <span className="text-[8px] font-bold text-choco-light block mt-0.5">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Associated donut selectors */}
              <div>
                <label className="text-xs font-bold text-choco-main uppercase block mb-1">Donut que comprou</label>
                <select
                  value={newDonutId}
                  onChange={(e) => {
                    playPopSound();
                    setNewDonutId(e.target.value);
                  }}
                  className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="pink-homer">🍩 Pink Homer</option>
                  <option value="dleite">🍮 Dleite</option>
                  <option value="choco">🍫 Choco</option>
                </select>
              </div>

              {/* Stars control */}
              <div>
                <label className="text-xs font-bold text-choco-main uppercase block mb-1">Nível de Delicitude</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setNewRating(i + 1);
                      }}
                      className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < newRating ? "text-amber-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment field */}
              <div>
                <label className="text-xs font-bold text-choco-main uppercase block mb-1">Seu Comentário Engraçado</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Mmmm... Fez cócegas no meu estômago!"
                  rows={2}
                  className="w-full bg-[#faf6eb] cartoon-border-sm rounded-xl py-2 px-3 text-xs font-bold focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-primary text-white font-fredoka font-black text-xs py-3 rounded-xl cartoon-border-sm cartoon-shadow-sm hover:scale-102 cursor-pointer uppercase"
              >
                Publicar Avaliação ⭐🌟
              </button>
            </form>
          </div>

          {/* Scrolling client replies feedback row */}
          <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar border-4 border-dashed border-choco-main/10 p-4 rounded-2xl bg-cream-yellow/30 flex flex-col justify-center min-h-[300px]">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-2 animate-pulse">📝💬</span>
                <h4 className="font-fredoka font-bold text-choco-main uppercase text-[15px] tracking-wide">Nenhuma avaliação publicada ainda</h4>
                <p className="text-xs text-choco-light max-w-sm mx-auto mt-1">
                  Não exibimos avaliações falsas! Seja o primeiro a deixar seu feedback real sobre nossos donuts preenchendo o formulário ao lado.
                </p>
              </div>
            ) : (
              reviews.map((rev) => {
                const pairedDonut = donuts.find((d) => d.id === rev.donutId);

                return (
                  <div
                    key={rev.id}
                    className="bg-white p-4 rounded-2xl border-3 border-choco-main cartoon-shadow-sm relative"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl block relative bg-cream-yellow p-1.5 rounded-xl border border-choco-main">
                        {rev.avatar}
                      </span>

                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-fredoka font-bold text-choco-main uppercase text-[15px] leading-tight">
                              {rev.author}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{rev.role}</span>
                          </div>
                          <span className="text-[10px] text-choco-light font-bold bg-cream-yellow px-2 py-0.5 rounded border border-choco-main">
                            {rev.date}
                          </span>
                        </div>

                        {/* Stars count */}
                        <div className="flex text-amber-400 my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-choco-light italic font-semibold leading-relaxed">
                          “{rev.comment}”
                        </p>

                        {pairedDonut && (
                          <div className="mt-2 text-[9px] font-bold text-choco-main bg-pink-50 border border-pink-200 rounded px-2 py-0.5 inline-block">
                            Avaliou: <strong className="text-pink-primary uppercase font-fredoka">{pairedDonut.name}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* Floating Sticky Actions (Quick WhatsApp Float and Delivery Banner) */}
      <div className="fixed bottom-4 left-4 z-30 select-none">
        <div className="bg-yellow-300 border-3 border-choco-main rounded-2xl p-2.5 cartoon-shadow-sm flex items-center gap-3 animate-bounce-gentle">
          <Bike className="text-choco-main animate-pulse" size={24} />
          <div className="text-left leading-tight hidden xs:block">
            <span className="text-[9px] font-fredoka uppercase font-bold text-choco-light block">Entrega Rápida</span>
            <span className="text-xs font-fredoka font-black text-pink-dark">R$ 7.90 ou Grátis!</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-30 select-none">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playPopSound();
            const message = `Olá! Gostaria de tirar uma dúvida sobre os donuts artesanais com vocês! 🍩👾`;
            window.open(`https://api.whatsapp.com/send?phone=5599999999999&text=${encodeURIComponent(message)}`, "_blank");
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 border-4 border-choco-main cartoon-shadow-lg flex items-center justify-center cursor-pointer relative group-hover:scale-105"
          title="Fale Conosco"
        >
          <motion.span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </motion.span>
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Discrete footer for owner/admin link */}
      <footer className="w-full py-8 mt-12 bg-white border-t-4 border-choco-main text-center text-choco-light font-bold text-xs select-none">
        <p>© 2026 Homer Donuts - Rosquinhas Tradicionais & Frescas 🍩</p>
        <button
          onClick={() => {
            playPopSound();
            setIsOwnerOpen(true);
          }}
          className="mt-3 text-[10px] text-pink-primary hover:underline flex items-center gap-1.5 mx-auto opacity-75 hover:opacity-100 cursor-pointer"
        >
          <span>🔐</span> Área Exclusiva do Dono (Controle de Pedidos)
        </button>
      </footer>

      {/* Interactive Cart Sidebar Slider Drawer */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => {
          playPopSound();
          setIsCartOpen(false);
        }}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        coupon={wonCoupon}
        onClearCart={handleClearCart}
        onOrderSubmitted={handleOrderSubmitted}
      />

      {/* Owner Dashboard Overlay Checklist Gate */}
      {isOwnerOpen && (
        <OwnerDashboard
          orders={orders}
          donuts={donuts}
          onUpdateStock={(id, newStock) => {
            setDonuts((prev) =>
              prev.map((d) => (d.id === id ? { ...d, stock: newStock } : d))
            );
          }}
          onClose={() => {
            playPopSound();
            setIsOwnerOpen(false);
          }}
          onToggleCheckedOff={(id) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === id ? { ...o, checkedOff: !o.checkedOff } : o))
            );
          }}
          onUpdateStatus={(id, status) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === id ? { ...o, status } : o))
            );
          }}
          onClearOrders={() => {
            setOrders([]);
            fireToast("Todos os pedidos foram apagados!", "🧼");
          }}
        />
      )}

      {/* Floating Bouncy Toast Container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-2 max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white px-4 py-3 rounded-2xl border-3 border-choco-main cartoon-shadow-md text-xs font-fredoka font-bold text-choco-main flex items-center gap-2.5 filter drop-shadow-md text-center justify-center select-none"
            >
              <span className="text-lg animate-bounce">{t.emoji}</span>
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
