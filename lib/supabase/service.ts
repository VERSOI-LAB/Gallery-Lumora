import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Bypasses RLS entirely. Only use from server-only admin code that has
// already verified the caller via assertAdminSession().
export const supabaseService = createClient<Database>(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});
