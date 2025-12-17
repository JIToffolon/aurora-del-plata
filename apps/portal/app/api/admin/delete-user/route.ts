import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1) validar sesión
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) validar rol admin (MI profile)
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 403 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) parse body
  const body = await req.json().catch(() => null);
  const user_id = body?.user_id as string | undefined;

  if (!user_id) {
    return NextResponse.json({ error: "user_id requerido" }, { status: 400 });
  }

  // (opcional) evitar que un admin se borre a sí mismo
  if (user_id === userData.user.id) {
    return NextResponse.json({ error: "No podés borrarte a vos mismo" }, { status: 400 });
  }

  // 4) borrar user (admin api)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
