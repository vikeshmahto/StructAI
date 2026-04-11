import { NextRequest, NextResponse } from "next/server";
import { refreshSchema } from "@/lib/schemas/authSchema";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { hashPassword, comparePassword } from "@/lib/auth/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Refresh token is required" } }, { status: 422 });
    }

    const { refreshToken: oldRefreshToken } = parsed.data;
    const payload = verifyRefreshToken(oldRefreshToken);

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", payload.id)
      .single();

    if (fetchError || !user || !user.refresh_token) {
      return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid session" } }, { status: 401 });
    }

    const isValid = await comparePassword(oldRefreshToken, user.refresh_token);
    if (!isValid) {
      // Theft suspected - revoke all
      await supabaseAdmin.from("users").update({ refresh_token: null }).eq("id", user.id);
      return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid session" } }, { status: 401 });
    }

    const newPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    const refreshTokenHash = await hashPassword(refreshToken);
    await supabaseAdmin.from("users").update({ refresh_token: refreshTokenHash }).eq("id", user.id);

    return NextResponse.json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid or expired token" } }, { status: 401 });
  }
}
