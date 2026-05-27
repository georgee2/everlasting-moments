import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

export function Countdown({ targetIso }: { targetIso: string }) {
  const t = useT();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cells = [
    { label: t("days"), value: d },
    { label: t("hours"), value: h },
    { label: t("minutes"), value: m },
    { label: t("seconds"), value: s },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl mx-auto">
      {cells.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.7 }}
          className="glass rounded-2xl px-3 py-5 sm:px-6 sm:py-7 text-center shadow-soft"
        >
          <div className="font-serif text-3xl sm:text-5xl text-espresso tabular-nums">
            {String(c.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {c.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
