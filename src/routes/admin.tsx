import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCheck, adminOverview, adminListInvites,
  adminCreateInvite, adminUpdateInvite, adminDeleteInvite,
  adminGetSettings, adminUpdateSettings,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Trash2, QrCode, LogOut } from "lucide-react";
import QRCode from "qrcode";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Merna & George" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<null | { user: { id: string; email?: string } }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session as never);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s as never));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">…</div>;
  if (!session) return <LoginForm />;
  return <Dashboard email={session.user.email ?? ""} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Failed";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-hero-gradient">
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-sm shadow-elegant">
        <h1 className="font-serif text-3xl text-center">Admin</h1>
        <p className="text-center text-xs text-muted-foreground mt-1">
          {mode === "signup" ? "Create the first admin account" : "Sign in to manage the invitation"}
        </p>
        <div className="mt-6 space-y-3">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </div>
        <Button disabled={busy} type="submit" className="mt-6 w-full rounded-full bg-espresso text-ivory hover:bg-espresso/90 h-11">
          {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <p className="mt-4 text-[10px] text-muted-foreground text-center">
          The first user to sign in becomes admin automatically.
        </p>
      </form>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const check = useServerFn(adminCheck);
  const { data: ok, isLoading, error } = useQuery({
    queryKey: ["admin-check"], queryFn: () => check(),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (error || !ok) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm text-destructive">Not an admin.</p>
          <Button variant="outline" onClick={() => supabase.auth.signOut()} className="mt-4">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="font-serif text-xl">M & G</Link>
            <span className="ml-3 text-xs text-muted-foreground">Admin · {email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
          <TabsContent value="guests" className="mt-6"><GuestsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewTab() {
  const fn = useServerFn(adminOverview);
  const { data } = useQuery({ queryKey: ["overview"], queryFn: () => fn() });
  const cards = [
    { label: "Total guests", value: data?.total ?? 0 },
    { label: "Accepted", value: data?.accepted ?? 0 },
    { label: "Declined", value: data?.declined ?? 0 },
    { label: "Pending", value: data?.pending ?? 0 },
    { label: "Attendees", value: data?.attendees ?? 0 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</CardTitle></CardHeader>
          <CardContent><div className="font-serif text-4xl">{c.value}</div></CardContent>
        </Card>
      ))}
    </div>
  );
}

function GuestsTab() {
  const qc = useQueryClient();
  const list = useServerFn(adminListInvites);
  const create = useServerFn(adminCreateInvite);
  const update = useServerFn(adminUpdateInvite);
  const del = useServerFn(adminDeleteInvite);
  const { data: invites = [] } = useQuery({ queryKey: ["invites"], queryFn: () => list() });
  const [name, setName] = useState("");
  const [type, setType] = useState<"default" | "vip" | "family" | "groom" | "bride" | "church" | "party">("default");
  const [showChurch, setShowChurch] = useState(true);
  const [showParty, setShowParty] = useState(true);

  const createMut = useMutation({
    mutationFn: () => create({ data: { guest_name: name, guest_type: type, show_church: showChurch, show_party: showParty, plus_one: false, vip: type === "vip" } }),
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["invites"] }); qc.invalidateQueries({ queryKey: ["overview"] }); toast.success("Guest added"); },
    onError: (e) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invites"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Add guest</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
          <div>
            <Label>Type</Label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {["default","vip","family","groom","bride","church","party"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2"><Switch checked={showChurch} onCheckedChange={setShowChurch} /><span className="text-xs">Church</span></div>
          <div className="flex items-center gap-2"><Switch checked={showParty} onCheckedChange={setShowParty} /><span className="text-xs">Party</span></div>
          <Button onClick={() => createMut.mutate()} disabled={!name || createMut.isPending} className="sm:col-span-5">Add guest</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {invites.map((g) => <GuestRow key={g.id} guest={g} onUpdate={(patch) => update({ data: { id: g.id, patch } }).then(() => qc.invalidateQueries({ queryKey: ["invites"] }))} onDelete={() => delMut.mutate(g.id)} />)}
        {!invites.length ? <p className="text-sm text-muted-foreground text-center py-12">No guests yet.</p> : null}
      </div>
    </div>
  );
}

function GuestRow({ guest, onUpdate, onDelete }: { guest: Awaited<ReturnType<typeof adminListInvites>>[number]; onUpdate: (patch: Record<string, unknown>) => void; onDelete: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/i/${guest.token}` : `/i/${guest.token}`;
  async function showQr() {
    const dataUrl = await QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: "#1a1612", light: "#f8f4ec" } });
    setQr(dataUrl);
  }
  const statusColor = guest.rsvp_status === "accepted" ? "text-emerald-700" : guest.rsvp_status === "declined" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex-1 min-w-[180px]">
        <div className="font-medium">{guest.guest_name}</div>
        <div className="text-xs text-muted-foreground">{guest.guest_type} · <span className={statusColor}>{guest.rsvp_status}</span>{guest.rsvp_status === "accepted" ? ` · ${guest.attendee_count}` : ""}</div>
      </div>
      <code className="text-[10px] text-muted-foreground truncate max-w-[200px]">{url}</code>
      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
      <Button size="sm" variant="ghost" onClick={showQr}><QrCode className="h-3.5 w-3.5" /></Button>
      <Button size="sm" variant="ghost" onClick={() => onUpdate({ vip: !guest.vip })}>{guest.vip ? "VIP ✓" : "VIP"}</Button>
      <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
      {qr ? (
        <div className="fixed inset-0 z-50 bg-espresso/80 flex items-center justify-center p-6" onClick={() => setQr(null)}>
          <div className="bg-ivory p-6 rounded-2xl shadow-elegant text-center">
            <img src={qr} alt="QR" className="w-72 h-72" />
            <p className="mt-3 text-xs text-muted-foreground">{guest.guest_name}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettingsTab() {
  const qc = useQueryClient();
  const get = useServerFn(adminGetSettings);
  const update = useServerFn(adminUpdateSettings);
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (s) setForm({
    couple_names: s.couple_names ?? "",
    couple_names_ar: s.couple_names_ar ?? "",
    wedding_date: s.wedding_date ? new Date(s.wedding_date).toISOString().slice(0, 16) : "",
    hero_tagline: s.hero_tagline ?? "",
    hero_tagline_ar: s.hero_tagline_ar ?? "",
    hero_image_url: s.hero_image_url ?? "",
    music_url: s.music_url ?? "",
    thank_you_message: s.thank_you_message ?? "",
    thank_you_message_ar: s.thank_you_message_ar ?? "",
  }); }, [s]);

  const mut = useMutation({
    mutationFn: () => update({ data: {
      couple_names: form.couple_names || undefined,
      couple_names_ar: form.couple_names_ar || null,
      wedding_date: form.wedding_date ? new Date(form.wedding_date).toISOString() : undefined,
      hero_tagline: form.hero_tagline || null,
      hero_tagline_ar: form.hero_tagline_ar || null,
      hero_image_url: form.hero_image_url || null,
      music_url: form.music_url || null,
      thank_you_message: form.thank_you_message || null,
      thank_you_message_ar: form.thank_you_message_ar || null,
    } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e) => toast.error(e.message),
  });

  const field = (key: string, label: string, type = "text") => (
    <div>
      <Label>{label}</Label>
      {key.includes("message") ? (
        <Textarea value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ) : (
        <Input type={type} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Site settings</CardTitle></CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        {field("couple_names", "Couple names")}
        {field("couple_names_ar", "Couple names (Arabic)")}
        {field("wedding_date", "Wedding date & time", "datetime-local")}
        {field("hero_tagline", "Hero tagline")}
        {field("hero_tagline_ar", "Hero tagline (Arabic)")}
        {field("hero_image_url", "Hero image URL")}
        {field("music_url", "Background music URL")}
        <div className="sm:col-span-2">{field("thank_you_message", "Thank-you message")}</div>
        <div className="sm:col-span-2">{field("thank_you_message_ar", "Thank-you message (Arabic)")}</div>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending} className="sm:col-span-2">Save</Button>
      </CardContent>
    </Card>
  );
}
