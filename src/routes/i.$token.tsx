import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Music2, MusicIcon, Languages, ArrowDown, Sparkles, Crown } from "lucide-react";
import { getInviteByToken, submitRsvp } from "@/lib/invites.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Petals, Reveal, Divider } from "@/components/site/decor";
import { Countdown } from "@/components/site/countdown";
import { useLang, useT, dict } from "@/lib/i18n";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";

const fallbackGallery = [g1, g2, g3, g4, hero];

export const Route = createFileRoute("/i/$token")({
  head: ({ params }) => ({
    meta: [
      { title: "You're invited — Merna & George" },
      { name: "description", content: `A personal invitation for ${params.token.slice(0, 6)}` },
      { property: "og:title", content: "You're invited — Merna & George" },
      { property: "og:image", content: "/og-invite.jpg" },
    ],
  }),
  component: InvitePage,
});

type LoaderData = Awaited<ReturnType<typeof getInviteByToken>>;

function InvitePage() {
  const { token } = Route.useParams();
  const fetchInvite = useServerFn(getInviteByToken);
  const { data, isLoading } = useQuery<LoaderData>({
    queryKey: ["invite", token],
    queryFn: () => fetchInvite({ data: { token } }),
  });

  if (isLoading) return <LoadingScreen />;
  if (!data?.invite) return <InvalidInvite />;
  return <Invitation data={data} token={token} />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Heart className="h-8 w-8 text-champagne" />
      </motion.div>
    </div>
  );
}

function InvalidInvite() {
  const t = useT();
  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 text-center">
      <div className="max-w-md">
        <Sparkles className="mx-auto h-8 w-8 text-champagne" />
        <h1 className="mt-6 font-serif text-3xl">{t("invalidInvite")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Please check the link and try again.</p>
      </div>
    </div>
  );
}

function Invitation({ data, token }: { data: LoaderData; token: string }) {
  const invite = data.invite!;
  const { events, settings, gallery } = data;
  const { lang, setLang } = useLang();
  const t = useT();
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const coupleNames = lang === "ar" && settings?.couple_names_ar ? settings.couple_names_ar : (settings?.couple_names ?? "Merna & George");
  const tagline = lang === "ar" && settings?.hero_tagline_ar ? settings.hero_tagline_ar : (settings?.hero_tagline ?? "Together, forever begins");
  const weddingDate = settings?.wedding_date ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();
  const heroImg = settings?.hero_image_url || hero;

  useEffect(() => {
    if (!audioRef.current || !settings?.music_url) return;
    if (musicOn) audioRef.current.play().catch(() => setMusicOn(false));
    else audioRef.current.pause();
  }, [musicOn, settings?.music_url]);

  const galleryItems = gallery.length ? gallery.map((g) => g.image_url) : fallbackGallery;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <Petals />
      {settings?.music_url ? <audio ref={audioRef} src={settings.music_url} loop /> : null}

      {/* Floating controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="glass rounded-full px-3 py-2 text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-soft"
        >
          <Languages className="h-3.5 w-3.5" /> {lang === "en" ? "AR" : "EN"}
        </button>
        {settings?.music_url ? (
          <button
            onClick={() => setMusicOn((v) => !v)}
            className="glass rounded-full p-2 shadow-soft"
            aria-label="Toggle music"
          >
            {musicOn ? <MusicIcon className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-overlay" />
        <div className="absolute inset-0 bg-glow opacity-60" />

        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.8 } }}
              className="relative z-10 text-center text-white px-4"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="uppercase text-xs tracking-[0.4em] opacity-90"
              >
                {invite.vip ? <span className="inline-flex items-center gap-1.5"><Crown className="h-3 w-3" /> {t("vip")}</span> : "An Invitation"}
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0, letterSpacing: "0.4em" }}
                animate={{ y: 0, opacity: 1, letterSpacing: "0.02em" }}
                transition={{ delay: 0.7, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-serif text-5xl sm:text-7xl md:text-8xl text-balance"
              >
                {coupleNames}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 1 }}
                className="mt-6 text-sm sm:text-base italic opacity-90 font-serif"
              >
                {tagline}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpened(true)}
                className="mt-12 rounded-full bg-white/90 px-8 py-3.5 text-espresso text-sm uppercase tracking-[0.3em] shadow-elegant hover:bg-white transition-colors"
              >
                {t("openInvitation")}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="opened"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}
              className="relative z-10 text-center text-white px-4"
            >
              <p className="uppercase text-xs tracking-[0.4em] opacity-90">
                {new Date(weddingDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <h1 className="mt-6 font-serif text-5xl sm:text-7xl md:text-8xl text-balance">{coupleNames}</h1>
              <p className="mt-6 text-sm sm:text-base italic opacity-90 font-serif">{tagline}</p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-16 inline-block opacity-70"
              >
                <ArrowDown className="h-5 w-5" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {opened ? (
        <>
          {/* PERSONAL WELCOME */}
          <section className="relative z-10 py-24 px-6 text-center">
            <Reveal>
              <p className="uppercase text-[10px] tracking-[0.4em] text-muted-foreground">{t("dear")}</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-6xl text-balance">
                {invite.guest_name}
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-muted-foreground leading-relaxed">
                {invite.custom_message || t("welcome")}
              </p>
            </Reveal>
            <Divider />
          </section>

          {/* COUNTDOWN */}
          <section className="relative z-10 py-20 px-6">
            <Reveal>
              <p className="text-center uppercase text-[10px] tracking-[0.4em] text-muted-foreground mb-8">
                {t("countdown")}
              </p>
              <Countdown targetIso={weddingDate} />
            </Reveal>
          </section>

          {/* STORY */}
          <section className="relative z-10 py-24 px-6 max-w-3xl mx-auto">
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-5xl text-center">{t("ourStory")}</h2>
              <Divider />
            </Reveal>
            <div className="space-y-12">
              {[
                { year: "2019", title: "How we met", body: "A quiet evening, an unforgettable conversation." },
                { year: "2022", title: "The proposal", body: "Under the stars, two became one promise." },
                { year: "2026", title: "Forever", body: "We can't wait to share this day with you." },
              ].map((s, i) => (
                <Reveal key={s.year} delay={i * 0.15}>
                  <div className="flex gap-6 sm:gap-10 items-baseline">
                    <div className="font-serif text-3xl sm:text-4xl text-champagne shrink-0 w-20">{s.year}</div>
                    <div>
                      <h3 className="font-serif text-2xl">{s.title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* GALLERY */}
          <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-5xl text-center">{t("gallery")}</h2>
              <Divider />
            </Reveal>
            <Gallery items={galleryItems} />
          </section>

          {/* EVENTS */}
          {events.length ? (
            <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
              <Reveal>
                <h2 className="font-serif text-4xl sm:text-5xl text-center">{t("events")}</h2>
                <Divider />
              </Reveal>
              <div className="grid sm:grid-cols-2 gap-6">
                {events.map((e, i) => (
                  <Reveal key={e.id} delay={i * 0.1}>
                    <div className="glass rounded-2xl p-8 shadow-soft h-full">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">
                        {e.event_time}
                      </p>
                      <h3 className="mt-3 font-serif text-3xl">
                        {lang === "ar" && e.title_ar ? e.title_ar : e.title}
                      </h3>
                      {e.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {lang === "ar" && e.description_ar ? e.description_ar : e.description}
                        </p>
                      ) : null}
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm">{e.location}</span>
                        {e.maps_link ? (
                          <a
                            href={e.maps_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-champagne hover:text-espresso transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5" /> {t("location")}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {/* DRESS CODE */}
          <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto text-center">
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-5xl">{t("dressCode")}</h2>
              <Divider />
              <div className="flex justify-center gap-3 sm:gap-6 mt-8">
                {["#f5efe4", "#e8dcc4", "#c9b896", "#8b6f4e", "#1a1612"].map((c) => (
                  <div key={c} className="text-center">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-soft" style={{ backgroundColor: c }} />
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-muted-foreground italic">
                Cocktail attire · warm neutral tones
              </p>
            </Reveal>
          </section>

          {/* SPECIAL GUEST INFO */}
          {(invite.table_number || invite.vip) ? (
            <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
              <Reveal>
                <div className="glass rounded-2xl p-8 shadow-soft text-center">
                  {invite.vip ? (
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-champagne">
                      <Crown className="h-3.5 w-3.5" /> {t("vip")}
                    </p>
                  ) : null}
                  {invite.table_number ? (
                    <p className="mt-4 font-serif text-3xl">
                      {t("tableNumber")} {invite.table_number}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            </section>
          ) : null}

          {/* RSVP */}
          <section className="relative z-10 py-24 px-6 max-w-2xl mx-auto">
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-5xl text-center">{t("rsvp")}</h2>
              <Divider />
              <RsvpForm token={token} invite={invite} />
            </Reveal>
          </section>

          {/* THANK YOU FOOTER */}
          <section className="relative z-10 py-32 px-6 text-center">
            <Reveal>
              <Sparkles className="mx-auto h-6 w-6 text-champagne" />
              <p className="mt-6 max-w-xl mx-auto text-muted-foreground italic leading-relaxed">
                {(lang === "ar" && settings?.thank_you_message_ar) || settings?.thank_you_message || dict.en.welcome}
              </p>
              <p className="mt-10 font-serif text-3xl">{coupleNames}</p>
            </Reveal>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Gallery({ items }: { items: string[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      <div className="columns-2 md:columns-3 gap-4 [&>*]:mb-4">
        {items.map((src, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.08 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActive(i)}
            className="block w-full overflow-hidden rounded-xl shadow-soft break-inside-avoid"
          >
            <img src={src} alt="" loading="lazy" className="w-full h-auto object-cover" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] bg-espresso/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              key={active}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              src={items[active]}
              className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-elegant"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type InviteRow = NonNullable<LoaderData["invite"]>;
function RsvpForm({ token, invite }: { token: string; invite: InviteRow }) {
  const t = useT();
  const navigate = useNavigate();
  const submit = useServerFn(submitRsvp);
  const [status, setStatus] = useState<"accepted" | "declined" | null>(
    invite.rsvp_status === "accepted" || invite.rsvp_status === "declined" ? invite.rsvp_status : null,
  );
  const [count, setCount] = useState(invite.attendee_count || 1);
  const [message, setMessage] = useState(invite.rsvp_message ?? "");

  const mutation = useMutation({
    mutationFn: async (data: { status: "accepted" | "declined" }) =>
      submit({ data: { token, status: data.status, attendee_count: count, rsvp_message: message } }),
    onSuccess: () => {
      toast.success(t("thankYou"));
      navigate({ to: "/i/$token", params: { token }, replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="glass rounded-2xl p-6 sm:p-10 shadow-soft">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setStatus("accepted"); }}
          className={`rounded-xl px-4 py-4 text-sm uppercase tracking-widest transition-all border ${status === "accepted" ? "bg-espresso text-ivory border-espresso" : "bg-transparent border-border hover:border-champagne"}`}
        >
          {t("accept")}
        </button>
        <button
          onClick={() => { setStatus("declined"); }}
          className={`rounded-xl px-4 py-4 text-sm uppercase tracking-widest transition-all border ${status === "declined" ? "bg-espresso text-ivory border-espresso" : "bg-transparent border-border hover:border-champagne"}`}
        >
          {t("decline")}
        </button>
      </div>

      {status === "accepted" ? (
        <div className="mt-6">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">{t("guests")}</label>
          <Input
            type="number"
            min={1}
            max={invite.plus_one ? 4 : 2}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2"
          />
        </div>
      ) : null}

      <div className="mt-6">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">{t("message")}</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          className="mt-2"
          placeholder="..."
        />
      </div>

      <Button
        onClick={() => status && mutation.mutate({ status })}
        disabled={!status || mutation.isPending}
        className="mt-6 w-full rounded-full bg-espresso text-ivory hover:bg-espresso/90 h-12 uppercase tracking-[0.25em] text-xs"
      >
        {mutation.isPending ? "..." : t("submit")}
      </Button>
    </div>
  );
}
