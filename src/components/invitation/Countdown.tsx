import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function Countdown({ date }: { date: Date }) {
  const { t } = useI18n();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const diff = Math.max(0, date.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const cells = [
    { v: d, l: t("days") }, { v: h, l: t("hours") },
    { v: m, l: t("minutes") }, { v: s, l: t("seconds") },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-xl mx-auto">
      {cells.map((c, i) => (
        <div key={i} className="rounded-xl bg-card/80 backdrop-blur border border-accent/20 py-4 md:py-6 text-center shadow-soft">
          <div className="font-display text-3xl md:text-5xl text-gradient-gold tabular-nums">{String(c.v).padStart(2, "0")}</div>
          <div className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wider">{c.l}</div>
        </div>
      ))}
    </div>
  );
}
