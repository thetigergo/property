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
        breed: string;
        parent: string;
      }[]
    >`SELECT cat_id, categoria, SUBSTRING(cat_id, 1, 7) AS breed,
        (SELECT categoria FROM prc.categories WHERE (cat_id = SUBSTRING(category.cat_id, 1, 7 ))) AS parent
      FROM prc.categories AS category
      WHERE (LENGTH(cat_id) = 11) AND (typed = 0)
      ORDER BY cat_id ASC;`;

    if (!result || result.length === 0)
      return NextResponse.json(
        { error: "Record not found", data: [] },
        { status: 205 }
      );

    return NextResponse.json(
      result.map((item) => ({
        catgid: item.cat_id,
        catego: item.categoria,
        breed: item.breed,
        parent: item.parent,
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
