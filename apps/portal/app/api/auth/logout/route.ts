import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function doLogout(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function POST(req: Request) {
  return doLogout(req);
}

export async function GET(req: Request) {
  return doLogout(req);
}
