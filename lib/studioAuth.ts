import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase/server";
import { getArtistById } from "./queries";
import type { Artist } from "./types";

// Resolves the logged-in Supabase Auth user to their artist profile.
// Redirects to /studio/login if unauthenticated, or /studio/pending if the
// account isn't linked to an approved artist yet (profiles.artist_id unset).
export const getCurrentArtist = cache(async (): Promise<Artist> => {
  const client = await createServerSupabaseClient();

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: profile, error } = await client
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile?.artist_id) redirect("/studio/pending");

  const artist = await getArtistById(profile.artist_id, client);
  if (!artist) redirect("/studio/pending");

  return artist;
});
