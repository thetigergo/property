import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import crypto from "crypto";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userid, passkey } = body;

    if (!userid || !passkey) {
      return NextResponse.json(
        { error: "Missing userid or password" },
        { status: 400 }
      );
    }
    const userLog = await prisma.userlogs.findUnique({
      where: { userid },
      include: { offices: true },
    });

    if (!userLog) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashKey = crypto.createHash("md5").update(passkey).digest("hex");

    if (userLog.passkey !== hashKey) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const Responed = NextResponse.json({
      pangalan: userLog.pangalan,
      permiso: userLog.permiso,
      officeid: userLog.officeid,
      offcode: userLog.offices?.located,
    });

    const now = new Date();
    const pinoyTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    await prisma.userlogs.update({
      where: { userid },
      data: {
        checkinn: pinoyTime, // ✅ this is a valid Date object
      },
    });

    Responed.cookies.set("auth_token", "some_secure_token", {
      httpOnly: true,
      secure: true,
      path: "/",
      expires: new Date(Date.now() + 60 /**2nd*/ * 30 /**mins*/ * 1000 /**ms*/), // → expires in 1 hour
    });

    return Responed;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: err + "Failed to fetch" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log("Querying Login finished.");
  }
}
