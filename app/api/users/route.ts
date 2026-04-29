import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@/generated/prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";
import { pool } from "@/libs/pgdb"; // Use the shared pool
import { makeToken } from "@/libs/tokenizer";

// const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: NextRequest) {
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

  try {
    const userLog = await pool.query(
      `SELECT
	      userlogs.passkey = MD5($1) AS passkey,
	      userlogs.pangalan,
	      userlogs.permiso,
	      offices.offcid,
	      offices.located
      FROM
	      prc.userlogs INNER JOIN prc.offices
	      ON userlogs.officeid = offices.offcid
      WHERE
	      (userid = $2);`,
      [passkey, userid],
    );
    const rowdata = userLog.rows[0];
    const count = userLog.rowCount;
    if (count === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (rowdata.passkey !== true) {
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
      userId: userid,
      pangalan: rowdata.pangalan,
      permiso: rowdata.permiso,
      officeId: rowdata.offcid,
      offcode: rowdata.located,
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
    console.log("Querying Login finished.");
  }
}
