/**
 *  /app/api/sysadmin/offclist/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient /*, Prisma*/ } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET() {
  try {
    const result = await prisma.offices.findMany({
      where: { grupo: { lt: 2 } },
      orderBy: [{ grupo: "asc" }, { opesina: "asc" }],
      select: {
        offcid: true,
        opesina: true,
        located: true,
        headed: true,
      },
    });

    if (!result || result.length === 0)
      return NextResponse.json(
        { error: "Record not found", data: [] },
        { status: 205 }
      );
    return NextResponse.json(
      result.map((item) => ({
        offcid: item.offcid,
        opesina: item.opesina,
        located: item.located,
        headed: item.headed,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Query Offclist finished.");
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await prisma.offices.update({
      where: { offcid: body.offcid },
      data: { headed: body.headed },
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Query Offclist finished.");
  }
}
