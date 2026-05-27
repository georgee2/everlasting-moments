import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // bootstrap: if no admin exists yet, grant admin to the first authenticated user
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (!count) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
      return;
    }
    throw new Error("Forbidden: admin only");
  }
}

export const adminCheck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    return { ok: true };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: invites } = await supabaseAdmin.from("invites").select("rsvp_status, attendee_count");
    const list = invites ?? [];
    const accepted = list.filter((i) => i.rsvp_status === "accepted");
    return {
      total: list.length,
      accepted: accepted.length,
      declined: list.filter((i) => i.rsvp_status === "declined").length,
      pending: list.filter((i) => i.rsvp_status === "pending").length,
      attendees: accepted.reduce((s, i) => s + (i.attendee_count || 0), 0),
    };
  });

export const adminListInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("invites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const inviteInput = z.object({
  guest_name: z.string().min(1).max(120),
  guest_type: z.enum(["bride", "groom", "family", "vip", "default", "church", "party"]).default("default"),
  phone: z.string().max(40).optional().nullable(),
  show_church: z.boolean().default(true),
  show_party: z.boolean().default(true),
  table_number: z.string().max(20).optional().nullable(),
  plus_one: z.boolean().default(false),
  vip: z.boolean().default(false),
  custom_message: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

function makeToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const adminCreateInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inviteInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const token = makeToken();
    const { data: row, error } = await supabaseAdmin
      .from("invites")
      .insert({ ...data, token })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), patch: inviteInput.partial() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("invites").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("invites").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data } = await supabaseAdmin.from("settings").select("*").eq("id", 1).maybeSingle();
    return data;
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      couple_names: z.string().min(1).max(120).optional(),
      couple_names_ar: z.string().max(120).optional().nullable(),
      wedding_date: z.string().optional(),
      hero_tagline: z.string().max(200).optional().nullable(),
      hero_tagline_ar: z.string().max(200).optional().nullable(),
      hero_image_url: z.string().url().max(500).optional().nullable(),
      music_url: z.string().url().max(500).optional().nullable(),
      thank_you_message: z.string().max(500).optional().nullable(),
      thank_you_message_ar: z.string().max(500).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
