import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "No token provided" } }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, is_verified, created_at, updated_at")
      .eq("id", payload.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid or expired token" } }, { status: 401 });
  }
}
