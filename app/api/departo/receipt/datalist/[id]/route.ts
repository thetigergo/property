import "dotenv/config";
/**
 * app\api\departo\receipt\datalist\[id]\route.ts
 */
import { PrismaClient, Prisma } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

// 1. Define the correct arguments for the handler
//    The first argument is the request object (NextRequest)
//    The second argument is an object containing the params
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parics = parseInt(id);

    if (isNaN(parics))
      return NextResponse.json(
        { error: "Invalid User ID format." },
        { status: 400 }
      );

    const result = await prisma.$queryRaw<
      {
        catdtld: string;
        quantiy: number;
        issued: string;
        detalye: string;
        specifyd: string;
        unitcost: number;
        acquired: number;
        uselife: number;
        property: string;
      }[]
    >(Prisma.sql`
        SELECT
          catdetails.catdtld,
          mrdetalyes.quantiy,
          mrdetalyes.issued,
          catsiblings.subcatename || ' - ' || catdetails.itemname AS detalye,
          mrdetalyes.specifyd,
          mrdetalyes.unitcost,
          mrdetalyes.acquired,
          mrdetalyes.uselife,
          mrdetalyes.property
        FROM ppe.mrdetalyes INNER JOIN prc.catdetails
          ON mrdetalyes.catdtld = catdetails.catdtld
          INNER JOIN prc.catsiblings  
          ON catdetails.cat_id = catsiblings.cat_id  
          AND catsiblings.subcat = catdetails.sub_cats  
        WHERE 
          (mrdetalyes.icsareno = ${parics});`);
    return NextResponse.json(
      result.map((item) => ({
        catdtld: item.catdtld,
        quantiy: item.quantiy,
        issued: item.issued,
        detalye: item.detalye,
        specifyd: item.specifyd,
        unitcost: item.unitcost,
        totalamt: item.unitcost * item.quantiy,
        acquired: new Date(item.acquired),
        uselife: item.uselife,
        property: item.property,
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
