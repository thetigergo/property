/**
 *  GET /app/api/departo/undone/[id]/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  /**
// This is GREAT. The pool manages the connections for you.
const [categories, items, settings] = await Promise.all([
  pool.query("SELECT * FROM ppe.categories"),
  pool.query("SELECT * FROM ppe.mritemize LIMIT 10"),
  pool.query("SELECT * FROM ppe.settings WHERE id = 1")
]);
*/

  try {
    const undone = await pool.query(
      `SELECT 
        mrproperty.icsareno,
        mrproperty.preparar,
        mrproperty.gikanni,
        categories.categoria
      FROM ppe.mrproperty INNER JOIN prc.categories
        ON mrproperty.expcode = categories.cat_id
      WHERE
        (mrproperty.opesina = $1) AND
        ((mrproperty.empkey IS NULL) OR
         (mrproperty.nagdawat IS NULL) OR
         (mrproperty.printed = FALSE))
      ORDER BY
        mrproperty.preparar ASC;`,
      [id],
    );

    return NextResponse.json(
      undone.rows.map((item) => ({
        icsareno: item.icsareno,
        preparar: item.preparar ? new Date(item.preparar).getTime() : null,
        gikanni: item.gikanni === null,
        categoria: item.categoria,
      })),
      { status: 200 },
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    console.log("Querying Undone finished.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parics = parseInt(id, 10);

  // 1. Get a dedicated client from the pool for the transaction
  const client = await pool.connect();
  try {
    // 2. Start the transaction
    await client.query("BEGIN");

    // 3. Execute your queries using the same client
    // Note: Use $1, $2 etc. for parameterized queries to prevent SQL injection
    /*const [res1, res2, res3] = await Promise.all([
      client.query("DELETE FROM ppe.mritemize WHERE (icsareno = $1)", [parics]),
      client.query("DELETE FROM ppe.mrdetalyes WHERE (icsareno = $1)", [parics,]),
      client.query("DELETE FROM ppe.mrproperty WHERE (icsareno = $1)", [parics,]),
    ]);*/
    // Execute sequentially instead of using Promise.all
    const res1 = await client.query(
      "DELETE FROM ppe.mritemize WHERE (icsareno = $1)",
      [parics],
    );
    const res2 = await client.query(
      "DELETE FROM ppe.mrdetalyes WHERE (icsareno = $1)",
      [parics],
    );
    const res3 = await client.query(
      "DELETE FROM ppe.mrproperty WHERE (icsareno = $1)",
      [parics],
    );

    // 4. Commit the transaction
    await client.query("COMMIT");

    const totalDeleted =
      (res1.rowCount ?? 0) + (res2.rowCount ?? 0) + (res3.rowCount ?? 0);
    if (totalDeleted === 0) {
      return NextResponse.json(
        { error: `No receipt found with ICS/ARE ID ${parics}.` },
        { status: 404 },
      );
    }
    return NextResponse.json({
      message: `Receipt ${parics} and ${totalDeleted} related records successfully deleted.`,
      status: 200,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Database error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    client.release();
    console.log("Querying Append finished.");
  }
}
