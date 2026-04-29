import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offcId = searchParams.get("offcid");

  try {
    const result = await pool.query<{
      empkey: string;
      humane: string;
      designate: string;
    }>(
      ` SELECT  
            empkey,
            CONCAT(lname, ', ', fname, ' ', suffix, COALESCE(suffix, '', ' '), mname) AS humane,
            designate
        FROM
            ppe.employees
        WHERE
            (jstatus = 1) AND (offcid = $1)
        ORDER BY 
            lname, fname, mname;`,
      [offcId],
    );
    return NextResponse.json(
      result.rows.map((item) => ({
        empkey: item.empkey,
        humane: item.humane,
        designate: item.designate,
      })),
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    console.log("Querying Employee finished.");
  }
}
