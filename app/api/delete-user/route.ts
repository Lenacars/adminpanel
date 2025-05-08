// app/api/delete-user/route.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // .env.local dosyasına eklemeyi unutma
);

export async function POST(req: Request) {
  const { id } = await req.json();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
