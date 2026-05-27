import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Merna & George — A Cinematic Wedding Invitation" },
      { name: "description", content: "Premium personalized wedding invitations. Each guest receives a unique link with tailored event details, RSVP, and a cinematic experience." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero})` }} />
      <div className="absolute inset-0 bg-overlay" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 text-white">
          <span className="font-serif text-xl">M & G</span>
          <Link to="/admin" className="text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100">
            Admin
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 text-center text-white">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <Heart className="mx-auto h-6 w-6" />
              <p className="mt-6 uppercase text-xs tracking-[0.4em] opacity-90">A cinematic invitation</p>
              <h1 className="mt-6 font-serif text-5xl sm:text-7xl text-balance">Merna & George</h1>
              <p className="mt-6 font-serif italic text-white/85">Together, forever begins</p>
              <p className="mt-10 max-w-md mx-auto text-sm text-white/80 leading-relaxed">
                Each guest receives a personal link with their own welcome, event details and RSVP. Visit your invitation at
                <code className="mx-1 px-2 py-0.5 rounded bg-white/10">/i/your-token</code>.
              </p>
              <Link
                to="/admin"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-espresso text-xs uppercase tracking-[0.3em] hover:bg-white transition-colors"
              >
                Open admin <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </main>
        <footer className="px-6 py-6 text-center text-white/60 text-xs">
          © Merna & George
        </footer>
      </div>
    </div>
  );
}
