/**
 *  /app/api/sysadmin/verifyer/[uid]/uid/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient /*, Prisma*/ } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const parics = parseInt(uid, 10);
    const result = await prisma.$queryRaw<
      {
        ngalan: string;
        categoria: string;
        opesina: string;
        preparar: Date;
      }[]
    >`SELECT
        humane(employees.lname, employees.fname, employees.mname, employees.suffix) as ngalan,  
        categories.categoria,  
        offices.opesina,  
        mrproperty.preparar  
      FROM
        ppe.mrproperty INNER JOIN ppe.employees  
        ON mrproperty.empkey = employees.empkey  
        INNER JOIN prc.offices ON mrproperty.opesina = offices.offcid  
        INNER JOIN prc.categories ON mrproperty.expcode = categories.cat_id  
      WHERE  
        (mrproperty.icsareno = ${parics});`;

    if (!result || result.length === 0)
      return NextResponse.json(
        { error: "Record not found", datos: [] },
        { status: 205 }
      );
    const item = result[0];
    return NextResponse.json({
      ngalan: item.ngalan,
      categoria: item.categoria,
      opesina: item.opesina,
      preparar: item.preparar.getTime(),
    });
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Query Verifyer finished.");
  }
}
