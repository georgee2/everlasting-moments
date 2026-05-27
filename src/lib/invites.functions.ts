import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getInviteByToken = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(8).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { data: invite, error } = await supabaseAdmin
      .from("invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite) return { invite: null, events: [], settings: null, gallery: [] };

    const [eventsRes, settingsRes, galleryRes] = await Promise.all([
      supabaseAdmin.from("events").select("*").eq("visible", true).order("sort_order"),
      supabaseAdmin.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("gallery").select("*").order("sort_order"),
    ]);

    const allEvents = eventsRes.data ?? [];
    const events = allEvents.filter((e) => {
      if (e.key === "church" && !invite.show_church) return false;
      if ((e.key === "party" || e.key === "after") && !invite.show_party) return false;
      return true;
    });

    return {
      invite,
      events,
      settings: settingsRes.data,
      gallery: galleryRes.data ?? [],
    };
  });

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      token: z.string().min(8).max(64),
      status: z.enum(["accepted", "declined"]),
      attendee_count: z.number().int().min(1).max(10),
      rsvp_message: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("invites")
      .update({
        rsvp_status: data.status,
        attendee_count: data.attendee_count,
        rsvp_message: data.rsvp_message ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("token", data.token);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin.from("settings").select("*").eq("id", 1).maybeSingle();
  return data;
});
