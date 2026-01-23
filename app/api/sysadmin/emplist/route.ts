import "dotenv/config";
/**
 * /app/api/sysadmin/emplist/route.ts
 */
import { PrismaClient } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET() {
  try {
    const result = await prisma.employees.findMany({
      orderBy: [{ lname: "asc" }, { fname: "asc" }],
      select: {
        empkey: true,
        lname: true,
        fname: true,
        mname: true,
        suffix: true,
        designate: true,
        offcid: true,
        offcids: true,
      },
    });

    return NextResponse.json(
      result.map((item) => ({
        empkey: item.empkey,
        lname: item.lname,
        fname: item.fname,
        mname: item.mname,
        suffix: item.suffix,
        ranggo: item.designate,
        offcid: item.offcid,
        offcids: item.offcids,
      }))
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Employee's List finished.");
  }
}
