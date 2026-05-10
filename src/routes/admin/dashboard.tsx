import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, LogOut, Search, Eye, Pencil, Trash2, ToggleLeft, ToggleRight, Heart, Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

interface Inv {
  id: string;
  slug: string;
  groom_name_uz: string;
  bride_name_uz: string;
  wedding_date: string | null;
  venue_name_uz: string | null;
  is_active: boolean;
  theme_color: string;
}

function Dashboard() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Inv[] | null>(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, guests: 0, rsvps: 0 });

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) navigate({ to: "/admin" });
  }, [session, isAdmin, loading, navigate]);

  useEffect(() => {
    if (session && isAdmin) load();
  }, [session, isAdmin]);

  async function load() {
    const { data: invs } = await supabase
      .from("invitations").select("*").order("created_at", { ascending: false });
    setItems((invs as Inv[]) || []);
    const { count: gc } = await supabase.from("guests").select("*", { count: "exact", head: true });
    const { count: rc } = await supabase.from("guests").select("*", { count: "exact", head: true }).neq("rsvp_status", "pending");
    setStats({
      total: invs?.length || 0,
      active: invs?.filter((i: any) => i.is_active).length || 0,
      guests: gc || 0,
      rsvps: rc || 0,
    });
  }

  async function toggleActive(inv: Inv) {
    const { error } = await supabase.from("invitations").update({ is_active: !inv.is_active }).eq("id", inv.id);
    if (error) toast.error(error.message); else { toast.success("Yangilandi"); load(); }
  }
  async function remove(inv: Inv) {
    if (!confirm(`Delete ${inv.groom_name_uz} & ${inv.bride_name_uz}?`)) return;
    const { error } = await supabase.from("invitations").delete().eq("id", inv.id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); load(); }
  }

  if (loading || !items) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }

  const filtered = items.filter(i =>
    !search || `${i.groom_name_uz} ${i.bride_name_uz} ${i.slug}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen paper-texture">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center"><Heart className="size-4" /></div>
            <span className="font-display text-xl">Taklifnoma</span>
          </Link>
          <button onClick={() => { signOut(); navigate({ to: "/admin" }); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <LogOut className="size-4" /> Chiqish
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Jami taklifnomalar", value: stats.total, icon: Heart },
            { label: "Faol", value: stats.active, icon: ToggleRight },
            { label: "Mehmonlar", value: stats.guests, icon: Users },
            { label: "Javoblar", value: stats.rsvps, icon: Calendar },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="font-display text-3xl mt-1">{s.value}</div>
                </div>
                <div className="size-10 rounded-lg bg-accent/30 grid place-items-center text-accent-foreground"><s.icon className="size-5" /></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full rounded-lg border bg-card pl-9 pr-4 py-2.5 outline-none focus:ring-2 ring-accent transition" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-serif-elegant italic text-muted-foreground">Hali taklifnomalar yo'q</div>
            <Link to="/admin/create" className="inline-flex items-center gap-2 mt-4 rounded-full bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition">
              <Plus className="size-4" /> Birinchi taklifnoma yaratish
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((inv, i) => (
              <motion.div key={inv.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-display text-xl">{inv.groom_name_uz} & {inv.bride_name_uz}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.is_active ? "bg-accent/30 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {inv.is_active ? "Faol" : "Yopiq"}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {inv.wedding_date && <div className="flex items-center gap-2"><Calendar className="size-3.5" /> {format(new Date(inv.wedding_date), "d MMM yyyy, HH:mm")}</div>}
                  {inv.venue_name_uz && <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {inv.venue_name_uz}</div>}
                  <div className="text-xs font-mono opacity-70">/i/{inv.slug}</div>
                </div>
                <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border/50">
                  <a href={`/i/${inv.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-muted transition" title="View"><Eye className="size-4" /></a>
                  <Link to="/admin/edit/$id" params={{ id: inv.id }} className="p-2 rounded-lg hover:bg-muted transition"><Pencil className="size-4" /></Link>
                  <button onClick={() => toggleActive(inv)} className="p-2 rounded-lg hover:bg-muted transition" title="Toggle">
                    {inv.is_active ? <ToggleRight className="size-4 text-accent-foreground" /> : <ToggleLeft className="size-4" />}
                  </button>
                  <button onClick={() => remove(inv)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition ml-auto"><Trash2 className="size-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Link to="/admin/create" className="fixed bottom-8 right-8 size-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-elegant hover:scale-110 transition-transform" style={{ animation: "pulse-gold 2s infinite" }}>
        <Plus className="size-6" />
      </Link>
    </div>
  );
}
