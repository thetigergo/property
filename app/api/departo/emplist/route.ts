import "dotenv/config";
/**
 * /api/departo/emplist/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { baseEmps } from "@/schemas/properties";
import { z } from "zod";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const validate = baseEmps.safeParse(body);
  if (!validate.success) {
    //console.error("Zod validation error:", validate.error);
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }
  const { ...datum } = validate.data;

  try {
    const sulod = datum as z.infer<typeof baseEmps>;
    const result = await pool.query(
      `UPDATE ppe.employees SET lname = $1, fname = $2, mname = $3, suffix = $4, designate = $5, offcid = $6, offcids = $7 WHERE (empkey = $8);`,
      [
        sulod.lname,
        sulod.fname,
        sulod.mname,
        sulod.suffix,
        sulod.ranggo,
        sulod.offcid,
        sulod.offcids,
        /** ~~~~~~~~~ */
        sulod.empkey,
      ],
    );
    return NextResponse.json(
      { message: "Employee updated successfully", datum: result },
      { status: 200 },
    );
  } catch (err) {
    console.error("Prisma error:", err);
    return NextResponse.json(
      { message: err + "Failed to update" },
      { status: 500 },
    );
  } finally {
    await pool.end();
    console.log("Updating Employee finished.");
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const empkey = searchParams.get("empkey");
  if (!empkey)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );

  try {
    const result = await pool.query(
      "DELETE FROM ppe.employees WHERE (empkey = $1);",
      [empkey],
    );
    return NextResponse.json(
      {
        message: `${result.rowCount} Employee deleted successfully!`,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    console.log("Deleting employee finished.");
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validate = baseEmps.safeParse(body);
  if (!validate.success) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }
  const { ...datum } = validate.data;

  try {
    const sulod = datum as z.infer<typeof baseEmps>;
    const result = await pool.query(
      `INSERT INTO ppe.employees (empkey, lname, fname, mname, suffix, designate, offcid, offcids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        sulod.empkey,
        sulod.lname,
        sulod.fname,
        sulod.mname,
        sulod.suffix,
        sulod.ranggo,
        sulod.offcid,
        sulod.offcids,
      ],
    );
    return NextResponse.json(
      { message: "Employee created successfully", datum: result },
      { status: 200 },
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  } finally {
    console.log("Creation employee finished.");
  }
}
