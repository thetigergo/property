import "dotenv/config";
import { PrismaClient, Prisma } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prid: string }> }
) {
  try {
    const { prid } = await params;
    const parics = parseInt(prid, 10);

    if (isNaN(parics))
      return NextResponse.json(
        { error: "Invalid User ID format." },
        { status: 400 }
      );

    const result = await prisma.$queryRaw<
      {
        preparar: Date;
        empkey: string;
        designate: string;
        opesina: string;
        expcode: string;
        categoria: string;
        details: string;
        nagdawat: string;
        ranggo: string;
      }[]
    >(Prisma.sql`SELECT
                  mrproperty.preparar,
                  mrproperty.empkey,
                  mrproperty.designate,
                  mrproperty.opesina,
                  mrproperty.expcode,
                  categories.categoria,
                  mrproperty.details,
                  mrproperty.nagdawat,
                  mrproperty.ranggo
                FROM
                    ppe.mrproperty INNER JOIN prc.categories
	                  ON mrproperty.expcode = categories.cat_id
                WHERE
                    (mrproperty.icsareno = ${parics});`);
    const item = result[0];
    return NextResponse.json({
      preparar: item.preparar.getTime(),
      empkey: item.empkey,
      designate: item.designate,
      opesina: item.opesina,
      expcode: item.expcode,
      expdesc: item.categoria,
      details: item.details,
      nagdawat: item.nagdawat,
      ranggo: item.ranggo,
    });
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Propertymain finished.");
  }
}
