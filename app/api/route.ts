/**
 * API route to fetch categories from the database.
 * /property/app/api/route.ts
 * */
import "dotenv/config";
import { /*NextRequest,*/ NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET() {
  try {
    const result = await prisma.$queryRaw<
      {
        cat_id: string;
        categoria: string;
      }[]
    >`SELECT cat_id, categoria FROM ( 
      SELECT cat_id, categoria, typed FROM prc.categories WHERE (typed = 0) 
      UNION ALL  
      SELECT categories.cat_id || '-' || catsiblings.subcat, catsiblings.subcatename, categories.typed FROM prc.catsiblings INNER JOIN prc.categories ON categories.cat_id = catsiblings.cat_id WHERE (categories.typed = 0)  
      UNION ALL  
      SELECT catdetails.catdtld, catdetails.itemname, categories.typed FROM prc.catdetails INNER JOIN prc.categories ON categories.cat_id = catdetails.cat_id WHERE (categories.typed = 0)  
    ) ORDER BY cat_id;`;

    if (!result || result.length === 0)
      return NextResponse.json(
        { error: "Record not found", data: [] },
        { status: 205 }
      );

    return NextResponse.json(
      result.map((item) => ({
        catgid: item.cat_id,
        catego: item.categoria,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Loading Category finished.");
  }
}
