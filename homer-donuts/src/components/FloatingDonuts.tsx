import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface Particle {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  size: number;
  rotation: number;
  emoji: string;
  speed: number;
}

export default function FloatingDonuts() {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth springs for cursor parallax
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    // Generate static floating candies/emojis in random coordinates
    const emojis = ["🍩", "🧁", "🍬", "🍭", "✨", "🌸", "⭐", "🌈"];
    const initialParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 85 + 5,
      size: Math.random() * 32 + 20,
      rotation: Math.random() * 360,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      speed: Math.random() * 1.5 + 0.5,
    }));
    setParticles(initialParticles);

    // Track cursor movement for nice parallax
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized value (-30 to +30 pixels maximum shift)
      const xShift = (e.clientX / window.innerWidth - 0.5) * 35;
      const yShift = (e.clientY / window.innerHeight - 0.5) * 35;
      mouseX.set(xShift);
      mouseY.set(yShift);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => {
        // Higher speeds react more severely to parallax, creating a 3D depth field!
        const transformX = p.speed * 0.6;
        const transformY = p.speed * 0.6;

        return (
          <motion.div
            key={p.id}
            className="absolute select-none filter drop-shadow-[0_4px_4px_rgba(55,30,15,0.15)] flex items-center justify-center"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              x: springX.get() * transformX, // Multiply for parallax depth
              y: springY.get() * transformY,
            }}
            animate={{
              y: [0, -15 * p.speed, 0],
              rotate: [p.rotation, p.rotation + 30, p.rotation],
            }}
            transition={{
              duration: 4 + p.speed * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {p.emoji}
          </motion.div>
        );
      })}

      {/* Decorative large organic sweet blobs on corners */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" />
      <div className="absolute top-[60%] -right-48 w-128 h-128 bg-cream-dark/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-48 left-[20%] w-112 h-112 bg-pink-sweet/20 rounded-full blur-3xl" />
    </div>
  );
}
