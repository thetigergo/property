/**
 *  /app/api/sysadmin/category/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient /*, Prisma*/ } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const catuid = searchParams.get("catuid");
  const subcat = searchParams.get("subcat");
  try {
    const result = await prisma.$queryRaw<
      {
        subcat: string;
        subcatename: string;
        catdtld: string;
        itemname: string;
        describes: string;
        pricetag: number;
      }[]
    >`SELECT  
        catsiblings.subcat,  
        catsiblings.subcatename,  
        catdetails.catdtld,  
        catdetails.itemname,  
        catdetails.describes,     
        catdetails.pricetag  
      FROM  
        prc.catsiblings INNER JOIN prc.catdetails  
        ON catsiblings.subcat = catdetails.sub_cats  
        AND catsiblings.cat_id = catdetails.cat_id  
      WHERE  
        (catsiblings.cat_id = ${catuid}) AND  
        (catdetails.sub_cats = ${subcat})  
      ORDER BY  
        catsiblings.subcat;`;

    // if (!result || result.length === 0)
    //   return NextResponse.json(
    //     { error: "Record not found", data: [] },
    //     { status: 205 }
    //   );
    return NextResponse.json(
      result.map((item) => ({
        subcat: item.subcat,
        subname: item.subcatename,
        catdtld: item.catdtld,
        itemname: item.itemname,
        describe: item.describes,
        pricetag: item.pricetag,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Query Unproven finished.");
  }
}
