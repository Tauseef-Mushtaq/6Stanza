import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactInquiryInput } from "@/lib/validation/contactInquiry";

/** Data access for `contact_inquiries`. See `lib/validation/contactInquiry.ts` for why nothing calls this yet. */
export async function insertContactInquiry(input: ContactInquiryInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("contact_inquiries").insert({
    name: input.name,
    email: input.email,
    message: input.message,
  });

  if (error) throw error;
}
