import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const catgid = searchParams.get("catgid");

  if (!catgid)
    return NextResponse.json({ error: "Missing catgid" }, { status: 400 });

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const loadrec = await pool.query<{
      subcat: string;
      catdtld: string;
      subcatename: string;
      itemname: string;
      describes: string;
    }>(
      `SELECT
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
        (catsiblings.cat_id = $1)  
    ORDER BY  
        catsiblings.subcatename,
        catdetails.itemname;`,
      [catgid],
    );

    // if (!loadrec || loadrec.length === 0)
    //   return NextResponse.json({ data: [] }); //, { status: 200 });

    return NextResponse.json(
      loadrec.rows.map((item) => ({
        subcat: item.subcat,
        catdtld: item.catdtld,
        subname: item.subcatename,
        itemname: item.itemname,
        describes: item.describes,
      })),
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await pool.end();
    console.log("Querying Loadunits finished.");
  }
}
