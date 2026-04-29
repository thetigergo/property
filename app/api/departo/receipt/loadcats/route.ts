import "dotenv/config";
import { /*NextRequest,*/ NextResponse } from "next/server";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function GET() {
  try {
    const result = await pool.query<{
      cat_id: string;
      categoria: string;
      breed: string;
      parent: string;
    }>(`SELECT cat_id, categoria, SUBSTRING(cat_id, 1, 7) AS breed,
        (SELECT categoria FROM prc.categories WHERE (cat_id = SUBSTRING(category.cat_id, 1, 7 ))) AS parent
      FROM prc.categories AS category
      WHERE (LENGTH(cat_id) = 11) AND (typed = 0)
      ORDER BY cat_id ASC;`);

    if (result.rows.length === 0)
      return NextResponse.json(
        { error: "Record not found", data: [] },
        { status: 205 },
      );

    return NextResponse.json(
      result.rows.map((item) => ({
        catgid: item.cat_id,
        catego: item.categoria,
        breed: item.breed,
        parent: item.parent,
      })),
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    console.log("Loading Category finished.");
  }
}
