import { NextResponse } from "next/server";
import {createServiceSupabaseClient} from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server"; // tu helper actual

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1) Validar sesión real (cookie-based)
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceSupabaseClient();

  // 2) Validar rol admin (con service role para evitar roces de RLS)
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (meErr || me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Buscar receta y crear signed url
  const { data: prescription, error: pErr } = await admin
    .from("prescriptions")
    .select("file_path")
    .eq("id", id)
    .single();

  if (pErr || !prescription?.file_path) {
    return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
  }

  const { data: signed, error: sErr } = await admin.storage
    .from("prescriptions")
    .createSignedUrl(prescription.file_path, 60 * 5); // 5 min

  if (sErr || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not sign url" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
