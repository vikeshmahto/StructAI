import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "No token provided" } }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    await supabaseAdmin.from("users").update({ refresh_token: null }).eq("id", payload.id);

    return NextResponse.json({ success: true, data: { message: "Logged out successfully" } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid session" } }, { status: 401 });
  }
}
