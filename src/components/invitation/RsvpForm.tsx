import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, Heart } from "lucide-react";

export default function RsvpForm({ invitationId }: { invitationId: string }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined" | "maybe">("confirmed");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("guests").insert({
      invitation_id: invitationId, name: name.trim(), rsvp_status: status,
      responded_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#c9a96e", "#fdf8f3", "#8B5E3C"] });
    toast.success(t("rsvpSuccess"));
  }

  if (done) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-10">
        <Heart className="size-12 mx-auto text-accent mb-3" />
        <div className="font-display text-2xl text-gradient-gold">{t("rsvpSuccess")}</div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md mx-auto">
      <input value={name} onChange={e => setName(e.target.value)} required placeholder={t("yourName")}
        className="w-full rounded-lg border bg-card/80 backdrop-blur px-4 py-3 outline-none focus:ring-2 ring-accent transition" />
      <div className="grid grid-cols-3 gap-2">
        {(["confirmed", "maybe", "declined"] as const).map(s => (
          <button type="button" key={s} onClick={() => setStatus(s)}
            className={`py-3 rounded-lg border transition text-sm ${status === s ? "border-accent bg-accent/20" : "border-border hover:bg-muted"}`}>
            {s === "confirmed" ? t("yes") : s === "maybe" ? t("maybe") : t("no")}
          </button>
        ))}
      </div>
      <button disabled={busy}
        className="w-full rounded-lg bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
        {busy && <Loader2 className="size-4 animate-spin" />}
        {t("submit")}
      </button>
    </form>
  );
}
