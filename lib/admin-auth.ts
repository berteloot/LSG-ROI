import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the admin password from the Authorization header.
 * Returns null if authenticated, or a NextResponse with 401 if not.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json(
      { error: "Admin authentication is not configured" },
      { status: 500 }
    );
  }

  if (token !== adminPassword) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  return null; // authenticated
}
