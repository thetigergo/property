import "dotenv/config";
/**
 * app\api\departo\emplist\[offcid]\route.ts
 */
import { PrismaClient } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ offcid: string }> }
) {
  try {
    const { offcid } = await params;
    if (!offcid)
      return NextResponse.json(
        { error: "Invalid parameter format." },
        { status: 400 }
      );
    if (offcid.startsWith("#")) {
      const oid = offcid.substring(1);
      const result = await prisma.employees.findMany({
        where: {
          offcids: {
            has: oid,
          },
        },
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
    } else if (offcid.startsWith("@")) {
      const oid = offcid.substring(1);
      const result = await prisma.offices.findUnique({
        where: {
          offcid: oid,
        },
        select: {
          opesina: true,
        },
      });
      return NextResponse.json([{ offcid: oid, opesina: result?.opesina }]);
    } else if (offcid.startsWith("Q")) {
      const result = await prisma.$queryRaw<
        { nextid: string }[]
      >`SELECT SUBSTR(DATE_PART('YEAR', NOW())::TEXT, 2, 3) || (MAX(SUBSTRING(empkey, 4))::SMALLINT + 1) AS nextid
        FROM ppe.employees WHERE (empkey LIKE (SUBSTR(DATE_PART('YEAR', NOW())::TEXT, 2, 3) || '%'));`;
      return NextResponse.json(result.map((item) => ({ nextid: item.nextid })));
    } else {
      const result = await prisma.offices.findMany({
        where: {
          grupo: { lt: 2 },
        },
        orderBy: [{ grupo: "asc" }, { opesina: "asc" }],
        select: {
          offcid: true,
          opesina: true,
        },
      });
      return NextResponse.json(
        result.map((item) => ({ offcid: item.offcid, opesina: item.opesina }))
      );
    }
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Employee's List finished.");
  }
}
