import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prid: string }> },
) {
  const { prid } = await params;
  const parics = parseInt(prid, 10);

  if (isNaN(parics))
    return NextResponse.json(
      { error: "Invalid User ID format." },
      { status: 400 },
    );

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query<{
      preparar: Date;
      empkey: string;
      designate: string;
      opesina: string;
      expcode: string;
      categoria: string;
      details: string;
      nagdawat: string;
      ranggo: string;
    }>(
      `SELECT
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
            (mrproperty.icsareno = $1);`,
      [parics],
    );
    const item = result.rows[0];
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
    console.error("Database error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await pool.end();
    console.log("Querying Propertymain finished.");
  }
}
