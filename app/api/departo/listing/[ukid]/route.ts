import "dotenv/config";
/**
 * app\api\departo\listing\[ukid]\route.ts
 */
import { PrismaClient, Prisma } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ukid: string }> }
) {
  try {
    const { ukid } = await params;

    if (!ukid)
      return NextResponse.json(
        { error: "Invalid Office ID." },
        { status: 400 }
      );

    const result = await prisma.$queryRaw<
      {
        icsareno: number;
        employee: string;
        categoria: string;
        preparar: number;
        verified: boolean;
      }[]
    >(Prisma.sql`SELECT
                    mrproperty.icsareno,  
                    humane(employees.lname, employees.fname, employees.mname, employees.suffix) AS employee,  
                    categories.categoria,  
                    mrproperty.preparar,  
                    mrproperty.verified  
                FROM  
                    ppe.mrproperty INNER JOIN prc.categories  
                    ON categories.cat_id =  mrproperty.expcode  
                    INNER JOIN ppe.employees  
                    ON mrproperty.empkey = employees.empkey  
                WHERE  
                    (mrproperty.empkey IS NOT NULL) AND 
                    (mrproperty.nagdawat IS NOT NULL) AND 
                    (mrproperty.printed) AND
                    (mrproperty.opesina = ${ukid}) AND  
                    (DATE_PART('YEAR', mrproperty.preparar) = DATE_PART('YEAR', NOW()))  
                ORDER BY  
                    mrproperty.preparar;`);
    return NextResponse.json(
      result.map((item) => ({
        paricsno: item.icsareno,
        employee: item.employee,
        categoria: item.categoria,
        preparar: item.preparar,
        status: item.verified,
      }))
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Listing finished.");
  }
}
