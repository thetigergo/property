import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@/generated/prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { makeToken } from "@/libs/tokenizer";
import crypto from "crypto";

// const prisma = new PrismaClient().$extends(withAccelerate());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userid, passkey } = body;

    if (!userid || !passkey) {
      return NextResponse.json(
        { error: "Missing userid or password" },
        { status: 400 },
      );
    }
    /*const userLog = await prisma.userlogs.findUnique({
      where: { userid },
      include: { offices: true },
    });*/
    const userLog = await pool.query(
      "SELECT passkey FROM prc.userlogs WHERE (userid = $1);",
      [userid],
    );
    const rowdata = userLog.rows[0];
    if (!rowdata) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashKey = crypto.createHash("md5").update(passkey).digest("hex");

    if (rowdata.passkey !== hashKey) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    /*const now = new Date();
    const pinoyTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
      );
      await prisma.userlogs.update({
      where: { userid },
      data: {
        checkinn: pinoyTime, // ✅ this is a valid Date object
      },
    });*/
    await pool.query(
      "UPDATE prc.userlogs SET checkinn = NOW() WHERE (userid = $1);",
      [userid],
    );

    // 🔑 Generate token here
    const token = await makeToken({ user: userid ?? "unknown" });

    const Responed = NextResponse.json({
      pangalan: rowdata.pangalan,
      permiso: rowdata.permiso,
      officeid: rowdata.officeid,
      offcode: rowdata.offices?.located,
      token: token,
    });

    Responed.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      //expires: new Date(Date.now() + 60 /**2nd*/ * 30 /**mins*/ * 1000 /**ms*/), // → expires in 1 hour
      sameSite: "lax",
    });

    return Responed;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: err + "Failed to fetch" },
      { status: 500 },
    );
  } finally {
    //await prisma.$disconnect();
    await pool.end();
    console.log("Querying Login finished.");
  }
}
