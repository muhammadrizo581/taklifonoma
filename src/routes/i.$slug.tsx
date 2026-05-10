import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang, type Lang } from "@/lib/i18n";
import Petals from "@/components/invitation/Petals";
import Countdown from "@/components/invitation/Countdown";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import RsvpForm from "@/components/invitation/RsvpForm";
import { Calendar, MapPin, Clock, Navigation, Share2, ChevronDown, Loader2, Heart, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/i/$slug")({ component: Invitation });

interface Inv {
  id: string; slug: string;
  groom_name_uz: string; groom_name_ru: string;
  bride_name_uz: string; bride_name_ru: string;
  wedding_date: string | null;
  venue_name_uz: string | null; venue_name_ru: string | null;
  venue_address_uz: string | null; venue_address_ru: string | null;
  venue_lat: number | null; venue_lng: number | null;
  welcome_text_uz: string | null; welcome_text_ru: string | null;
  cover_image: string | null; couple_photo: string | null;
  music_url: string | null;
  is_active: boolean;
}

function Invitation() {
  const { slug } = Route.useParams();
  const { lang, setLang, t } = useI18n();
  const [inv, setInv] = useState<Inv | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("invitations").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      setInv(data as Inv | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (!inv) return (
    <div className="min-h-screen grid place-items-center text-center px-6">
      <div>
        <Heart className="size-12 mx-auto text-muted-foreground mb-3" />
        <div className="font-display text-2xl">Taklifnoma topilmadi</div>
        <p className="text-muted-foreground mt-2">Bu havola noto'g'ri yoki taklifnoma faol emas.</p>
      </div>
    </div>
  );

  const groom = pickLang(inv.groom_name_uz, inv.groom_name_ru, lang);
  const bride = pickLang(inv.bride_name_uz, inv.bride_name_ru, lang);
  const venue = pickLang(inv.venue_name_uz, inv.venue_name_ru, lang);
  const address = pickLang(inv.venue_address_uz, inv.venue_address_ru, lang);
  const welcome = pickLang(inv.welcome_text_uz, inv.welcome_text_ru, lang);
  const date = inv.wedding_date ? new Date(inv.wedding_date) : null;

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `${groom} & ${bride}`, url });
    else { navigator.clipboard.writeText(url); toast.success("Havola nusxalandi"); }
  }

  function directions() {
    if (inv?.venue_lat && inv?.venue_lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${inv.venue_lat},${inv.venue_lng}`, "_blank");
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
    }
  }

  return (
    <div className="min-h-screen paper-texture relative overflow-x-hidden">
      <Petals />
      {inv.music_url && <MusicPlayer src={inv.music_url} />}

      {/* Lang switcher */}
      <div className="fixed top-4 right-4 z-30 bg-card/90 backdrop-blur border border-accent/30 rounded-full p-1 flex shadow-soft">
        {(["uz", "ru"] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        {inv.cover_image && (
          <div className="absolute inset-0 -z-10">
            <img src={inv.cover_image} className="w-full h-full object-cover opacity-30 blur-[2px]" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          <div className="font-serif-elegant italic text-sm md:text-base text-muted-foreground mb-6 tracking-wide">
            {t("bismillah")}
          </div>
          <div className="ornament-divider mb-8 max-w-xs mx-auto"><Sparkles className="size-4" /></div>
        </motion.div>

        {inv.couple_photo && (
          <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
            src={inv.couple_photo} className="size-44 md:size-56 rounded-full object-cover border-4 border-accent/40 shadow-elegant mb-8" alt="" />
        )}

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-tight">
          <span className="text-gradient-gold">{groom}</span>
          <div className="font-serif-elegant italic text-3xl md:text-4xl text-muted-foreground my-2">&</div>
          <span className="text-gradient-gold">{bride}</span>
        </motion.h1>

        {date && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
            className="mt-8 font-serif-elegant text-xl md:text-2xl text-foreground/80">
            {format(date, "d MMMM yyyy")}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground">
          <ChevronDown className="size-6 animate-bounce" />
        </motion.div>
      </section>

      {/* WELCOME */}
      {welcome && (
        <section className="py-20 px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto text-center">
            <div className="ornament-divider mb-8"><Heart className="size-4" /></div>
            <p className="font-serif-elegant italic text-xl md:text-2xl leading-relaxed text-foreground/80">
              {welcome}
            </p>
            <div className="ornament-divider mt-8"><Heart className="size-4" /></div>
          </motion.div>
        </section>
      )}

      {/* DETAILS */}
      <section className="py-20 px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-card/80 backdrop-blur rounded-3xl p-8 md:p-12 shadow-elegant border border-accent/20">
          <h2 className="font-display text-3xl text-center mb-8 text-gradient-gold">{t("weddingDetails")}</h2>
          <div className="space-y-6">
            {date && (
              <Detail icon={Calendar} label={t("date")}>{format(date, "EEEE, d MMMM yyyy")}</Detail>
            )}
            {date && (
              <Detail icon={Clock} label={t("time")}>{format(date, "HH:mm")}</Detail>
            )}
            {(venue || address) && (
              <Detail icon={MapPin} label={t("venue")}>
                {venue && <div className="font-medium">{venue}</div>}
                {address && <div className="text-sm text-muted-foreground">{address}</div>}
              </Detail>
            )}
          </div>
        </motion.div>
      </section>

      {/* COUNTDOWN */}
      {date && date.getTime() > Date.now() && (
        <section className="py-16 px-6 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-2xl md:text-3xl mb-8 text-gradient-gold">{t("countdown")}</h2>
            <Countdown date={date} />
          </motion.div>
        </section>
      )}

      {/* MAP */}
      {(inv.venue_lat && inv.venue_lng) && (
        <section className="py-16 px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl text-center mb-6 text-gradient-gold">{t("location")}</h2>
            <div className="rounded-2xl overflow-hidden shadow-elegant border border-accent/20">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${inv.venue_lng - 0.01},${inv.venue_lat - 0.005},${inv.venue_lng + 0.01},${inv.venue_lat + 0.005}&layer=mapnik&marker=${inv.venue_lat},${inv.venue_lng}`}
                className="w-full h-[300px] md:h-[400px]" loading="lazy"
              />
            </div>
            <div className="text-center mt-4">
              <button onClick={directions} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition">
                <Navigation className="size-4" /> {t("getDirections")}
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-20 px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-md mx-auto text-center">
          <div className="ornament-divider mb-6"><Heart className="size-4" /></div>
          <h2 className="font-display text-3xl mb-2 text-gradient-gold">{t("rsvp")}</h2>
          <p className="text-muted-foreground mb-6 text-sm">{t("willYouAttend")}</p>
          <RsvpForm invitationId={inv.id} />
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center relative z-10">
        <div className="ornament-divider mb-4 max-w-xs mx-auto"><Sparkles className="size-4" /></div>
        <p className="font-serif-elegant italic text-lg text-foreground/70">{t("thankYou")}</p>
        <button onClick={share} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <Share2 className="size-4" /> {t("share")}
        </button>
        <div className="mt-8 text-xs text-muted-foreground/60">{t("poweredBy")}</div>
      </footer>
    </div>
  );
}

function Detail({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ x: 4 }} className="flex gap-4 items-start">
      <div className="size-10 rounded-full bg-accent/20 grid place-items-center text-accent-foreground shrink-0"><Icon className="size-5" /></div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-foreground mt-0.5">{children}</div>
      </div>
    </motion.div>
  );
}
