import "dotenv/config";
/**
 * /api/departo/emplist/route.ts
 */
import { PrismaClient } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { baseEmps } from "@/schemas/properties";
import { z } from "zod";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const validate = baseEmps.safeParse(body);
  if (!validate.success) {
    //console.error("Zod validation error:", validate.error);
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  const { ...datum } = validate.data;
  try {
    const sulod = datum as z.infer<typeof baseEmps>;
    const result = await prisma.employees.update({
      where: {
        empkey: sulod.empkey,
      },
      data: {
        lname: sulod.lname,
        fname: sulod.fname,
        mname: sulod.mname,
        suffix: sulod.suffix,
        designate: sulod.ranggo,
        offcid: sulod.offcid,
        offcids: sulod.offcids,
      },
    });
    return NextResponse.json(
      { message: "Employee updated successfully", datum: result },
      { status: 200 }
    );
  } catch (err) {
    console.error("Prisma error:", err);
    return NextResponse.json(
      { message: err + "Failed to update" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log("Updating Employee finished.");
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const empkey = searchParams.get("empkey");
  if (!empkey)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  try {
    const employResult = await prisma.employees.delete({
      where: {
        empkey: empkey,
      },
    });

    return NextResponse.json(
      {
        message: `${employResult} Employee deleted successfully!`,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Deleting employee finished.");
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validate = baseEmps.safeParse(body);
  if (!validate.success) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  const { ...datum } = validate.data;
  try {
    const sulod = datum as z.infer<typeof baseEmps>;
    const result = await prisma.employees.create({
      data: {
        empkey: sulod.empkey,
        lname: sulod.lname,
        fname: sulod.fname,
        mname: sulod.mname,
        suffix: sulod.suffix,
        designate: sulod.ranggo,
        offcid: sulod.offcid,
        offcids: sulod.offcids,
      },
    });
    return NextResponse.json(
      { message: "Employee created successfully", datum: result },
      { status: 200 }
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Creation employee finished.");
  }
}
