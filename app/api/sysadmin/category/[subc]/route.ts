/**
 * app/api/sysadmin/category/[subc]/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subc: string }> }
) {
  const { subc } = await params;

  try {
    const loadrec = await prisma.$queryRaw<
      {
        subcat: string;
        subcatename: string;
        countz: number;
      }[]
    >`WITH subcategory AS ( 
        SELECT cat_id, subcat, subcatename FROM prc.catsiblings WHERE (cat_id = ${subc}) 
      ), ihaponon AS ( 
        SELECT COUNT(*)::SMALLINT AS countz  
        FROM prc.catdetails INNER JOIN subcategory ON subcategory.subcat = catdetails.sub_cats  
        AND catdetails.cat_id = subcategory.cat_id  
      ) SELECT subcat, subcatename, countz FROM subcategory CROSS JOIN ihaponon ORDER BY subcatename;`;

    /*if (!loadrec || loadrec.length === 0)
      return new Response("Not found", { status: 404 });*/

    return NextResponse.json(
      loadrec.map((item) => ({
        subcat: item.subcat,
        subname: item.subcatename,
        countz: item.countz,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Category finished.");
  }
}
