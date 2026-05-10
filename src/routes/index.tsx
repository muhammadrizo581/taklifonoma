import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles, Globe, Music, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taklifnoma — Zamonaviy elektron to'y taklifnomalari" },
      { name: "description", content: "Yaqinlaringizga unutilmas taklifnoma yarating. O'zbek va rus tillarida." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen paper-texture">
      {/* Nav */}
      <nav className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-lg">T</div>
          <span className="font-display text-xl">Taklifnoma</span>
        </div>
        <Link to="/admin" className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition">
          Admin
        </Link>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-12 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="ornament-divider mb-6"><Sparkles className="size-4" /></div>
          <h1 className="font-display text-5xl md:text-7xl leading-tight">
            <span className="text-gradient-gold">Eng go'zal</span>
            <br />
            to'y taklifnomalari
          </h1>
          <p className="mt-6 text-lg text-muted-foreground font-serif-elegant italic max-w-2xl mx-auto">
            Создайте незабываемое цифровое приглашение для самого важного дня в вашей жизни.
            O'zbek va rus tillarida nafis dizayn.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/admin" className="rounded-full bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90 transition shadow-elegant">
              Boshlash
            </Link>
          </div>
        </motion.div>

        <div className="mt-24 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Heart, title: "Premium dizayn", desc: "Har bir taklifnoma alohida muhabbat bilan yaratiladi" },
            { icon: Globe, title: "2 ta til", desc: "O'zbek va rus tillari avtomatik almashinadi" },
            { icon: Music, title: "Musiqa va animatsiya", desc: "Jonli effektlar va fon musiqasi" },
            { icon: MapPin, title: "Karta integratsiyasi", desc: "Mehmonlar yo'lni oson topishadi" },
            { icon: Calendar, title: "Hisoblagich", desc: "To'y kuniga qancha qolganini ko'rsatadi" },
            { icon: Sparkles, title: "RSVP", desc: "Mehmonlar o'z javoblarini bildirishadi" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-card p-6 text-left shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="size-10 rounded-lg bg-accent/30 grid place-items-center text-accent-foreground mb-3">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-display text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © Taklifnoma · Made with <Heart className="inline size-3 text-accent" />
      </footer>
    </div>
  );
}
