import "dotenv/config";
/**
 * app\api\departo\emplist\[offcid]\route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ offcid: string }> },
) {
  const { offcid } = await params;
  if (!offcid)
    return NextResponse.json(
      { error: "Invalid parameter format." },
      { status: 400 },
    );

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    if (offcid.startsWith("#")) {
      const oid = offcid.substring(1);
      const result = await pool.query(
        "SELECT empkey, lname, fname, mname, suffix, designate, offcid FROM ppe.employees WHERE (offcids = $1) ORDER BY lname ASC, fname ASC;",
        [oid],
      );

      return NextResponse.json(
        result.rows.map((item) => ({
          empkey: item.empkey,
          lname: item.lname,
          fname: item.fname,
          mname: item.mname,
          suffix: item.suffix,
          ranggo: item.designate,
          offcid: item.offcid,
          offcids: item.offcids,
        })),
      );
    } else if (offcid.startsWith("@")) {
      const oid = offcid.substring(1);
      const result = await pool.query(
        "SELECT opesina FROM prc.offices WHERE (offcid = $1);",
        [oid],
      );

      return NextResponse.json([
        { offcid: oid, opesina: result.rows[0]?.opesina },
      ]);
    } else if (offcid.startsWith("Q")) {
      const result = await pool.query(
        "SELECT SUBSTR(DATE_PART('YEAR', NOW())::TEXT, 2, 3) || (MAX(SUBSTRING(empkey, 4))::SMALLINT + 1) AS nextid FROM ppe.employees WHERE (empkey LIKE (SUBSTR(DATE_PART('YEAR', NOW())::TEXT, 2, 3) || '%'));",
      );
      return NextResponse.json(
        result.rows.map((item) => ({ nextid: item.nextid })),
      );
    } else {
      const result = await pool.query(
        "SELECT offcid, opesina FROM prc.offices WHERE (grupo < 2) ORDER BY grupo ASC, opesina ASC;",
      );
      return NextResponse.json(
        result.rows.map((item) => ({
          offcid: item.offcid,
          opesina: item.opesina,
        })),
      );
    }
  } catch (e) {
    console.error("Database error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await pool.end();
    console.log("Querying Employee's List finished.");
  }
}
