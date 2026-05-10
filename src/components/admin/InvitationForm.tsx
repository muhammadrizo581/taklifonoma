import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Upload, ChevronLeft, ChevronRight, Check } from "lucide-react";

const THEMES = [
  { id: "gold", name: "Oltin", color: "oklch(0.78 0.10 75)" },
  { id: "rose", name: "Atirgul", color: "oklch(0.75 0.12 20)" },
  { id: "sage", name: "Sham", color: "oklch(0.70 0.08 150)" },
  { id: "navy", name: "Tungi", color: "oklch(0.40 0.08 250)" },
  { id: "blush", name: "Pushti", color: "oklch(0.85 0.06 10)" },
  { id: "emerald", name: "Zumrad", color: "oklch(0.55 0.12 160)" },
  { id: "burgundy", name: "Sharob", color: "oklch(0.40 0.12 20)" },
  { id: "ivory", name: "Sadaf", color: "oklch(0.92 0.02 80)" },
];

const PATTERNS = ["floral", "geometric", "minimal", "ornate"];
const FONTS = ["classic", "modern", "romantic", "editorial"];

const STEPS = ["Couple", "Details", "Design", "Guests", "Publish"];

interface Props { invitationId?: string; }

export default function InvitationForm({ invitationId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!invitationId);

  const [form, setForm] = useState({
    slug: "",
    groom_name_uz: "", groom_name_ru: "",
    bride_name_uz: "", bride_name_ru: "",
    wedding_date: "",
    venue_name_uz: "", venue_name_ru: "",
    venue_address_uz: "", venue_address_ru: "",
    venue_lat: "" as string | number,
    venue_lng: "" as string | number,
    welcome_text_uz: "", welcome_text_ru: "",
    cover_image: "" as string | null,
    couple_photo: "" as string | null,
    music_url: "" as string | null,
    theme_color: "gold",
    pattern_style: "floral",
    font_pair: "classic",
    is_active: true,
  });
  const [guests, setGuests] = useState<{ name: string; phone: string }[]>([]);

  useEffect(() => {
    if (!invitationId) return;
    (async () => {
      const { data, error } = await supabase.from("invitations").select("*").eq("id", invitationId).single();
      if (error || !data) { toast.error("Topilmadi"); return; }
      setForm({
        slug: data.slug,
        groom_name_uz: data.groom_name_uz, groom_name_ru: data.groom_name_ru,
        bride_name_uz: data.bride_name_uz, bride_name_ru: data.bride_name_ru,
        wedding_date: data.wedding_date ? data.wedding_date.slice(0, 16) : "",
        venue_name_uz: data.venue_name_uz || "", venue_name_ru: data.venue_name_ru || "",
        venue_address_uz: data.venue_address_uz || "", venue_address_ru: data.venue_address_ru || "",
        venue_lat: data.venue_lat ?? "",
        venue_lng: data.venue_lng ?? "",
        welcome_text_uz: data.welcome_text_uz || "", welcome_text_ru: data.welcome_text_ru || "",
        cover_image: data.cover_image, couple_photo: data.couple_photo, music_url: data.music_url,
        theme_color: data.theme_color, pattern_style: data.pattern_style, font_pair: data.font_pair,
        is_active: data.is_active,
      });
      const { data: g } = await supabase.from("guests").select("name, phone").eq("invitation_id", invitationId);
      setGuests((g || []).map((x: any) => ({ name: x.name, phone: x.phone || "" })));
      setLoading(false);
    })();
  }, [invitationId]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function uploadFile(file: File, bucket: "invitation-images" | "invitation-music") {
    const path = `${user!.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  function autoSlug() {
    const s = `${form.groom_name_uz}-${form.bride_name_uz}`.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    set("slug", s);
  }

  async function save() {
    if (!form.slug) { autoSlug(); return; }
    setBusy(true);
    const payload = {
      ...form,
      owner_id: user!.id,
      wedding_date: form.wedding_date ? new Date(form.wedding_date).toISOString() : null,
      venue_lat: form.venue_lat === "" ? null : Number(form.venue_lat),
      venue_lng: form.venue_lng === "" ? null : Number(form.venue_lng),
    };
    let id = invitationId;
    if (invitationId) {
      const { error } = await supabase.from("invitations").update(payload).eq("id", invitationId);
      if (error) { toast.error(error.message); setBusy(false); return; }
    } else {
      const { data, error } = await supabase.from("invitations").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setBusy(false); return; }
      id = data.id;
    }
    if (id && guests.length) {
      await supabase.from("guests").delete().eq("invitation_id", id);
      const rows = guests.filter(g => g.name.trim()).map(g => ({ invitation_id: id!, name: g.name, phone: g.phone || null }));
      if (rows.length) await supabase.from("guests").insert(rows);
    }
    setBusy(false);
    toast.success("Saqlandi!");
    navigate({ to: "/admin/dashboard" });
  }

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen paper-texture">
      <div className="container mx-auto max-w-3xl px-6 py-8">
        <button onClick={() => navigate({ to: "/admin/dashboard" })} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
          <ChevronLeft className="size-4" /> Orqaga
        </button>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button onClick={() => setStep(i)}
                className={`size-9 rounded-full grid place-items-center text-sm font-medium transition
                  ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="size-4" /> : i + 1}
              </button>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 transition ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl">{STEPS[step]}</h1>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-6 md:p-8 shadow-soft space-y-4">
          {step === 0 && (
            <>
              <Field label="Kuyov ismi (UZ)" value={form.groom_name_uz} onChange={v => set("groom_name_uz", v)} />
              <Field label="Имя жениха (RU)" value={form.groom_name_ru} onChange={v => set("groom_name_ru", v)} />
              <Field label="Kelin ismi (UZ)" value={form.bride_name_uz} onChange={v => set("bride_name_uz", v)} />
              <Field label="Имя невесты (RU)" value={form.bride_name_ru} onChange={v => set("bride_name_ru", v)} />
              <FileField label="Juftlik surati" value={form.couple_photo} onUpload={async f => set("couple_photo", await uploadFile(f, "invitation-images"))} />
            </>
          )}
          {step === 1 && (
            <>
              <Field label="To'y sanasi va vaqti" type="datetime-local" value={form.wedding_date} onChange={v => set("wedding_date", v)} />
              <Field label="To'yxona nomi (UZ)" value={form.venue_name_uz} onChange={v => set("venue_name_uz", v)} />
              <Field label="Название места (RU)" value={form.venue_name_ru} onChange={v => set("venue_name_ru", v)} />
              <Field label="Manzil (UZ)" value={form.venue_address_uz} onChange={v => set("venue_address_uz", v)} />
              <Field label="Адрес (RU)" value={form.venue_address_ru} onChange={v => set("venue_address_ru", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kenglik (lat)" value={String(form.venue_lat)} onChange={v => set("venue_lat", v)} placeholder="41.3111" />
                <Field label="Uzunlik (lng)" value={String(form.venue_lng)} onChange={v => set("venue_lng", v)} placeholder="69.2797" />
              </div>
              <Field label="Xush kelibsiz matni (UZ)" textarea value={form.welcome_text_uz} onChange={v => set("welcome_text_uz", v)} />
              <Field label="Приветствие (RU)" textarea value={form.welcome_text_ru} onChange={v => set("welcome_text_ru", v)} />
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Tema rangi</label>
                <div className="grid grid-cols-4 gap-3">
                  {THEMES.map(t => (
                    <button type="button" key={t.id} onClick={() => set("theme_color", t.id)}
                      className={`p-3 rounded-lg border-2 transition ${form.theme_color === t.id ? "border-primary" : "border-transparent hover:border-border"}`}>
                      <div className="size-10 rounded-full mx-auto" style={{ background: t.color }} />
                      <div className="text-xs mt-2">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Naqsh</label>
                <div className="grid grid-cols-4 gap-2">
                  {PATTERNS.map(p => (
                    <button type="button" key={p} onClick={() => set("pattern_style", p)}
                      className={`px-3 py-2 rounded-lg border transition text-sm capitalize ${form.pattern_style === p ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Shrift</label>
                <div className="grid grid-cols-4 gap-2">
                  {FONTS.map(p => (
                    <button type="button" key={p} onClick={() => set("font_pair", p)}
                      className={`px-3 py-2 rounded-lg border transition text-sm capitalize ${form.font_pair === p ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <FileField label="Muqova surati" value={form.cover_image} onUpload={async f => set("cover_image", await uploadFile(f, "invitation-images"))} />
              <FileField label="Fon musiqasi (mp3)" accept="audio/*" value={form.music_url} onUpload={async f => set("music_url", await uploadFile(f, "invitation-music"))} />
            </>
          )}
          {step === 3 && (
            <>
              <div className="text-sm text-muted-foreground">Mehmonlar ro'yxati (ixtiyoriy)</div>
              {guests.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <input value={g.name} onChange={e => setGuests(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Ism" className="flex-1 rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 ring-accent" />
                  <input value={g.phone} onChange={e => setGuests(p => p.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))}
                    placeholder="Telefon" className="w-40 rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 ring-accent" />
                  <button type="button" onClick={() => setGuests(p => p.filter((_, j) => j !== i))} className="px-3 text-muted-foreground hover:text-destructive">×</button>
                </div>
              ))}
              <button type="button" onClick={() => setGuests(p => [...p, { name: "", phone: "" }])}
                className="rounded-lg border-2 border-dashed border-border w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition">
                + Mehmon qo'shish
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <div className="flex gap-2">
                <Field label="URL slug" value={form.slug} onChange={v => set("slug", v)} placeholder="ali-malika" />
              </div>
              <button type="button" onClick={autoSlug} className="text-sm text-primary hover:underline">Avtomatik yaratish</button>
              <div className="text-sm text-muted-foreground rounded-lg bg-muted/50 px-3 py-2 font-mono">/i/{form.slug || "..."}</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="size-4" />
                <span className="text-sm">Faol (mehmonlar ko'ra olishadi)</span>
              </label>
            </>
          )}
        </motion.div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="rounded-lg px-4 py-2 text-sm hover:bg-muted transition disabled:opacity-40 inline-flex items-center gap-1">
            <ChevronLeft className="size-4" /> Oldingi
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm hover:bg-primary/90 transition inline-flex items-center gap-1">
              Keyingi <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={save} disabled={busy} className="rounded-lg bg-primary text-primary-foreground px-6 py-2 text-sm hover:bg-primary/90 transition inline-flex items-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Saqlash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 ring-accent transition" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 ring-accent transition" />
      )}
    </div>
  );
}

function FileField({ label, value, onUpload, accept = "image/*" }: {
  label: string; value: string | null; onUpload: (f: File) => Promise<void> | void; accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value && (accept.startsWith("image") ? <img src={value} className="size-16 rounded-lg object-cover" /> : <audio src={value} controls className="h-10" />)}
        <label className="cursor-pointer rounded-lg border border-dashed px-4 py-2 text-sm hover:bg-muted transition inline-flex items-center gap-2">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {value ? "O'zgartirish" : "Yuklash"}
          <input type="file" accept={accept} className="hidden" onChange={async e => {
            const f = e.target.files?.[0]; if (!f) return;
            setBusy(true); await onUpload(f); setBusy(false);
          }} />
        </label>
      </div>
    </div>
  );
}
