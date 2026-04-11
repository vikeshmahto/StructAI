import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/schemas/authSchema";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/hash";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", fields: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_ALREADY_EXISTS", message: "Email already registered" } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Insert user
    const { data: user, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ name, email, password_hash: passwordHash })
      .select("id, name, email, role, created_at")
      .single();

    if (insertError) throw insertError;

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token hash
    const refreshTokenHash = await hashPassword(refreshToken);
    await supabaseAdmin.from("users").update({ refresh_token: refreshTokenHash }).eq("id", user.id);

    return NextResponse.json({ success: true, data: { user, accessToken, refreshToken } });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
