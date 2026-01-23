import "dotenv/config";
import { PrismaClient, Prisma } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offcId = searchParams.get("offcid");
  try {
    const result = await prisma.$queryRaw<
      { empkey: string; humane: string; designate: string }[]
    >(Prisma.sql`
        SELECT  
            empkey,
            CONCAT(lname, ', ', fname, ' ', suffix, COALESCE(suffix, '', ' '), mname) AS humane,
            designate
        FROM
            ppe.employees
        WHERE
            (jstatus = 1) AND (offcid = ${offcId})
        ORDER BY 
            lname, fname, mname;`);
    return NextResponse.json(
      result.map((item) => ({
        empkey: item.empkey,
        humane: item.humane,
        designate: item.designate,
      }))
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Employee finished.");
  }
}
