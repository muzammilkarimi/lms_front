import { NextRequest, NextResponse } from "next/server";

import { STUDENT_TOKEN_COOKIE } from "../../lib/studentAuth";

type SessionPayload = {
  token?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as SessionPayload;
  const token = payload.token?.trim() ?? "";
  const isProduction = process.env.NODE_ENV === "production";

  if (!token) {
    return NextResponse.json({ detail: "Token is required." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDENT_TOKEN_COOKIE, token, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    secure: isProduction,
    sameSite: "lax",
  });
  return response;
}

export async function DELETE() {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDENT_TOKEN_COOKIE, "", {
    httpOnly: false,
    maxAge: 0,
    path: "/",
    secure: isProduction,
    sameSite: "lax",
  });
  return response;
}
