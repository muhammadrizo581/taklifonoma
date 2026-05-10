import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

function AdminLogin() {
  const { session, isAdmin, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else if (mode === "signup") toast.success("Hisob yaratildi! Tizimga kirilmoqda...");
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture grid place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex size-14 rounded-full bg-primary text-primary-foreground items-center justify-center mb-4">
            <Heart className="size-6" />
          </div>
          <h1 className="font-display text-3xl">Taklifnoma Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" ? "Tizimga kiring" : "Yangi hisob yarating"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-card rounded-2xl p-8 shadow-elegant space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 outline-none focus:ring-2 ring-accent transition"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Parol</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 outline-none focus:ring-2 ring-accent transition"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition"
          >
            {mode === "login" ? "Hisob yo'qmi? Ro'yxatdan o'ting" : "Allaqachon hisobingiz bormi? Kiring"}
          </button>
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground text-center">
              Birinchi ro'yxatdan o'tgan foydalanuvchi avtomatik admin bo'ladi.
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
