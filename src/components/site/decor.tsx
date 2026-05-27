import { motion } from "framer-motion";

export function Petals() {
  const items = Array.from({ length: 14 });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 1.1;
        const size = 6 + (i % 4) * 3;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-champagne/40 animate-float"
            style={{
              left: `${left}%`,
              top: `${(i * 23) % 100}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 my-12">
      <span className="h-px w-16 bg-champagne/50" />
      <svg width="14" height="14" viewBox="0 0 14 14" className="text-champagne">
        <circle cx="7" cy="7" r="2" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-champagne/50" />
    </div>
  );
}
