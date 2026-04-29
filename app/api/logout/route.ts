import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function POST(req: NextRequest) {
  const cookieStore = await cookies(); // ✅ Await this in Next.js 14+
  const body = await req.json();
  const { userid } = body;

  try {
    const userLog = await pool.query(
      "UPDATE prc.userlogs SET checkout = NOW() WHERE (userid = $1);",
      [userid],
    );
    if (!userLog) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Clear the cookie
    cookieStore.delete("auth_token");

    // 🔑 Generate token here
    const respond = NextResponse.json({ success: true }, { status: 200 });
    return respond;
  } catch (error) {
    console.error("Error during server logout:", error);
    return NextResponse.json(
      { message: "Logout failed due to server error." },
      { status: 500 },
    );
  } finally {
    // Ensure the pool is closed after the operation
    if (pool && !pool.ended) await pool.end();
  }
}
