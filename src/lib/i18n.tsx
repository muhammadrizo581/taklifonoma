import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "uz" | "ru";

const dict = {
  uz: {
    welcome: "Xush kelibsiz",
    bismillah: "Bismillahir Rohmanir Rohiym",
    weAreInvited: "Sizni to'yimizga taklif qilamiz",
    weddingDetails: "To'y tafsilotlari",
    countdown: "To'yga qancha qoldi",
    days: "kun", hours: "soat", minutes: "daqiqa", seconds: "soniya",
    location: "Manzil",
    getDirections: "Yo'l ko'rsatish",
    rsvp: "Tashrifni tasdiqlash",
    yourName: "Ismingiz",
    willYouAttend: "Tashrif buyurasizmi?",
    yes: "Ha, albatta", no: "Yo'q, kelolmayman", maybe: "Ehtimol",
    submit: "Yuborish",
    thankYou: "Tashrif buyurganingiz uchun rahmat",
    poweredBy: "Taklifnoma orqali tayyorlandi",
    share: "Ulashish",
    addToCalendar: "Kalendarga qo'shish",
    rsvpSuccess: "Javobingiz uchun rahmat!",
    venue: "Manzil",
    date: "Sana",
    time: "Vaqt",
  },
  ru: {
    welcome: "Добро пожаловать",
    bismillah: "Бисмиллахир Рохманир Рохийм",
    weAreInvited: "Приглашаем вас на нашу свадьбу",
    weddingDetails: "Детали свадьбы",
    countdown: "Сколько осталось до свадьбы",
    days: "дн.", hours: "ч.", minutes: "мин.", seconds: "сек.",
    location: "Место",
    getDirections: "Маршрут",
    rsvp: "Подтвердить визит",
    yourName: "Ваше имя",
    willYouAttend: "Придёте ли вы?",
    yes: "Да, конечно", no: "Нет, не смогу", maybe: "Возможно",
    submit: "Отправить",
    thankYou: "Спасибо за ваш визит",
    poweredBy: "Создано на Taklifnoma",
    share: "Поделиться",
    addToCalendar: "В календарь",
    rsvpSuccess: "Спасибо за ваш ответ!",
    venue: "Место",
    date: "Дата",
    time: "Время",
  },
} as const;

type Key = keyof typeof dict["uz"];

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children, initial = "uz" }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "uz" || stored === "ru") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: Key) => dict[lang][k] ?? k;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

export function pickLang(uz: string | null | undefined, ru: string | null | undefined, lang: Lang): string {
  if (lang === "ru") return ru || uz || "";
  return uz || ru || "";
}
