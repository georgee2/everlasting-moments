import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

export const dict = {
  en: {
    dear: "Dear",
    welcome: "we are honored to celebrate this special day with you.",
    openInvitation: "Open Invitation",
    countdown: "Counting down to forever",
    days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds",
    ourStory: "Our Story",
    gallery: "Moments",
    events: "Celebrations",
    dressCode: "Dress Code",
    rsvp: "Will you join us?",
    accept: "Joyfully Accept",
    decline: "Regretfully Decline",
    guests: "Number of guests",
    message: "Leave a message",
    submit: "Send response",
    thankYou: "Thank you",
    tableNumber: "Table",
    vip: "VIP",
    location: "Open in Maps",
    invalidInvite: "This invitation is no longer available",
    home: "Home",
    admin: "Admin",
    yourName: "your name",
  },
  ar: {
    dear: "عزيزي",
    welcome: "يشرفنا الاحتفال معك بهذا اليوم المميز.",
    openInvitation: "افتح الدعوة",
    countdown: "العد التنازلي للأبد",
    days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثوان",
    ourStory: "قصتنا",
    gallery: "لحظات",
    events: "الاحتفالات",
    dressCode: "الزي",
    rsvp: "هل ستنضم إلينا؟",
    accept: "أقبل بفرح",
    decline: "أعتذر بأسف",
    guests: "عدد المدعوين",
    message: "اترك رسالة",
    submit: "إرسال الرد",
    thankYou: "شكراً لك",
    tableNumber: "طاولة",
    vip: "كبار الضيوف",
    location: "افتح الخريطة",
    invalidInvite: "هذه الدعوة لم تعد متاحة",
    home: "الرئيسية",
    admin: "الإدارة",
    yourName: "اسمك",
  },
} as const;

export type DictKey = keyof typeof dict.en;

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return (k: DictKey) => dict[lang][k];
}

export function useLangState() {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);
  return { lang, setLang: setLangState };
}
