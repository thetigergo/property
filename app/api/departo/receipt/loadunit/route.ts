import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const catgid = searchParams.get("catgid");

  if (!catgid)
    return NextResponse.json({ error: "Missing catgid" }, { status: 400 });

  try {
    const loadrec = await prisma.$queryRaw<
      {
        subcat: string;
        catdtld: string;
        subcatename: string;
        itemname: string;
        describes: string;
      }[]
    >`SELECT
	      catsiblings.subcat,
        catdetails.catdtld,
        catsiblings.subcatename,
        catdetails.itemname,
        catdetails.describes  
    FROM  
        prc.catsiblings INNER JOIN prc.catdetails  
        ON catsiblings.cat_id = catdetails.cat_id  
        AND catsiblings.subcat = catdetails.sub_cats  
    WHERE  
        (catsiblings.cat_id = ${catgid})  
    ORDER BY  
        catsiblings.subcatename,
        catdetails.itemname;`;

    // if (!loadrec || loadrec.length === 0)
    //   return NextResponse.json({ data: [] }); //, { status: 200 });

    return NextResponse.json(
      loadrec.map((item) => ({
        subcat: item.subcat,
        catdtld: item.catdtld,
        subname: item.subcatename,
        itemname: item.itemname,
        describes: item.describes,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Loadunits finished.");
  }
}
