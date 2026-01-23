import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
const AUTH_COOKIE_KEY = "auth_token";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies(); // ✅ Await this in Next.js 14+
    const body = await req.json();
    const { userid } = body;
    console.log(userid);
    const userLog = await prisma.userlogs.update({
      where: { userid },
      data: {
        checkout: new Date(),
      },
    });
    if (!userLog) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    cookieStore.delete(AUTH_COOKIE_KEY); // ✅ Now delete is available

    // ✅ Clear cookie (if you're using one)
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_KEY, "", {
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Error during server logout:", error);
    return NextResponse.json(
      { message: "Logout failed due to server error." },
      { status: 500 }
    );
  }
}
