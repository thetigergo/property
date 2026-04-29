import "dotenv/config";
/**
 * app\api\departo\receipt\datalist\route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { baseFields } from "@/schemas/properties";
import { z } from "zod";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const validate = baseFields.safeParse(body);
  if (!validate.success) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }
  const { ...datum } = validate.data;

  try {
    const sulod = datum as z.infer<typeof baseFields>;
    const result = await pool.query(
      "UPDATE ppe.mrdetalyes SET catdtld = $1, issued = $2, specifyd = $3, unitcost = $4, acquired = $5, uselife = $6 WHERE (icsareno = $7) AND (property = $8)",
      [
        sulod.catdtld,
        sulod.issued,
        sulod.specifyd,
        sulod.unitcost,
        sulod.acquired,
        sulod.uselife,
        sulod.icsareno,
        sulod.property,
      ],
    );
    return NextResponse.json(
      { message: "Property updated successfully", datum: result.rowCount },
      { status: 200 },
    );
  } catch (err) {
    console.error("Property error:", err);
    return NextResponse.json(
      { message: err + "Failed to update" },
      { status: 500 },
    );
  } finally {
    console.log("Updating Property finished.");
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parics = searchParams.get("parics");
  const things = searchParams.get("thing");
  if (!parics || !things)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );

  const client = await pool.connect();
  try {
    const paricsNum = parseInt(parics, 10);

    await client.query("BEGIN"); // Start a transaction
    const itemizeResult = await client.query(
      "DELETE FROM ppe.mritemize WHERE (property = $1 AND icsareno = $2)",
      [things, paricsNum],
    );
    const detalyesResult = await client.query(
      "DELETE FROM ppe.mrdetalyes WHERE (icsareno = $1 AND property = $2)",
      [paricsNum, things],
    );
    await client.query("COMMIT"); // Commit the transaction

    const totalDeleted =
      (itemizeResult.rowCount ?? 0) + (detalyesResult.rowCount ?? 0);
    return NextResponse.json(
      {
        message: `${totalDeleted} Property deleted successfully!`,
      },
      { status: 200 },
    );
  } catch (e) {
    await client.query("ROLLBACK"); // Rollback the transaction on error
    console.error("Database error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    client.release();
    console.log("Deleting property finished.");
  }
}
