import "dotenv/config";
import { pool } from "@/libs/pgdb"; // Use the shared pool
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anios = searchParams.get("anios");
  const offcid = searchParams.get("offcid");

  try {
    if (!anios || !offcid)
      return NextResponse.json(
        { error: "Invalid parameter format." },
        { status: 400 },
      );

    const years = parseInt(anios, 10);

    const result = await pool.query<{
      icsareno: number;
      employee: string;
      categoria: string;
      preparar: number;
      verified: boolean;
    }>(
      `SELECT
          mrproperty.icsareno,  
          humane(employees.lname, employees.fname, employees.mname, employees.suffix) AS employee,  
          categories.categoria,  
          mrproperty.preparar,  
          mrproperty.verified  
      FROM  
          ppe.mrproperty INNER JOIN prc.categories  
          ON categories.cat_id =  mrproperty.expcode  
          INNER JOIN ppe.employees  
          ON mrproperty.empkey = employees.empkey  
      WHERE  
          (mrproperty.empkey IS NOT NULL) AND 
          (mrproperty.nagdawat IS NOT NULL) AND 
          (mrproperty.printed) AND
          (mrproperty.opesina = $1) AND  
          (DATE_PART('YEAR', mrproperty.preparar) = $2)  
      ORDER BY  
          mrproperty.preparar;`,
      [offcid, years],
    );
    return NextResponse.json(
      result.rows.map((item) => ({
        paricsno: item.icsareno,
        employee: item.employee,
        categoria: item.categoria,
        preparar: item.preparar,
        status: item.verified,
      })),
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    console.log("Querying Listing finished.");
  }
}
