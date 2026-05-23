export interface DonutProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge: string;
  badgeColor: string; // for bg color tailwind class
  rating: number;
  ratingCount: number;
  funFact: string;
  stock: number;
  stats: {
    sweetness: number; // 0-100%
    fluffiness: number; // 0-100%
    crunchiness: number; // 0-100%
  };
}

export interface CartItem {
  donut: DonutProduct;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  role: string;
  comment: string;
  rating: number;
  donutId: string;
  date: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryTime: string;
  notes?: string;
  items: {
    donutName: string;
    quantity: number;
  }[];
  total: number;
  couponApplied?: string;
  status: "Pendente" | "Preparando" | "Entregue";
  createdAt: string;
  checkedOff: boolean;
}

export const DONUTS_DATA: DonutProduct[] = [
  {
    id: "dleite",
    name: "Dleite",
    description: "fofinho, cobertura de doce de leite.",
    price: 5.00,
    image: "/src/assets/images/caramel_dleite_donut_1779490402224.png",
    badge: "Doce de Leite 🍮",
    badgeColor: "bg-amber-400 text-amber-950",
    rating: 5.0,
    ratingCount: 0,
    funFact: "Preparado com doce de leite caseiro tradicional.",
    stock: 30,
    stats: {
      sweetness: 80,
      fluffiness: 85,
      crunchiness: 15
    }
  },
  {
    id: "pink-homer",
    name: "Pink Homer",
    description: "Chocolate branco, estilo Homer.",
    price: 5.00,
    image: "/src/assets/images/pink_homer_donut_1779490383457.png",
    badge: "Tradicional 🍩",
    badgeColor: "bg-pink-500 text-white",
    rating: 5.0,
    ratingCount: 0,
    funFact: "O corte redondo é feito manualmente na nossa cozinha.",
    stock: 30,
    stats: {
      sweetness: 75,
      fluffiness: 90,
      crunchiness: 50
    }
  },
  {
    id: "choco",
    name: "Choco",
    description: "Delicioso e bem chocolatudo.",
    price: 5.00,
    image: "/src/assets/images/choco_premium_donut_1779490416978.png",
    badge: "Chocolate Tradicional 🍫",
    badgeColor: "bg-yellow-900 text-yellow-100",
    rating: 5.0,
    ratingCount: 0,
    funFact: "A cobertura utiliza cacau selecionado e derretido na temperatura exata.",
    stock: 30,
    stats: {
      sweetness: 70,
      fluffiness: 85,
      crunchiness: 20
    }
  }
];

export const REVIEWS_DATA: Review[] = [];

export const TIMELINE_STEPS = [
  { label: "Recebido", desc: "Aguardando na fila", color: "bg-blue-400" },
  { label: "Massa", desc: "Preparando a massa fresca", color: "bg-purple-400" },
  { label: "Fritura", desc: "Dourando na temperatura certa", color: "bg-amber-400" },
  { label: "Cobertura", desc: "Aplicando os recheios e confeitos", color: "bg-pink-400" },
  { label: "Pronto", desc: "Embalado para entrega", color: "bg-emerald-400" }
];

