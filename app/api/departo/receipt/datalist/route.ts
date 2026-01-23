import "dotenv/config";
/**
 * app\api\departo\receipt\datalist\route.ts
 */
import { PrismaClient } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { baseFields } from "@/schemas/properties";
import { z } from "zod";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const validate = baseFields.safeParse(body);
  if (!validate.success) {
    //console.error("Zod validation error:", validate.error);
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  const { ...datum } = validate.data;
  try {
    const sulod = datum as z.infer<typeof baseFields>;
    const result = await prisma.mrdetalyes.update({
      where: {
        icsareno_property: {
          icsareno: sulod.icsareno,
          property: sulod.property,
        },
      },
      data: {
        catdtld: sulod.catdtld,
        issued: sulod.issued,
        specifyd: sulod.specifyd,
        unitcost: sulod.unitcost,
        acquired: new Date(sulod.acquired),
        uselife: sulod.uselife,
      },
    });
    return NextResponse.json(
      { message: "Property updated successfully", datum: result },
      { status: 200 }
    );
  } catch (err) {
    console.error("Property error:", err);
    return NextResponse.json(
      { message: err + "Failed to update" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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
      { status: 400 }
    );
  try {
    const paricsNum = parseInt(parics, 10);
    const [itemizeResult, detalyesResult] = await prisma.$transaction([
      prisma.mritemize.deleteMany({
        where: {
          property: things,
          icsareno: paricsNum,
        },
      }),
      prisma.mrdetalyes.deleteMany({
        where: {
          icsareno: paricsNum,
          property: things,
        },
      }),
    ]);

    const totalDeleted = itemizeResult.count + detalyesResult.count;
    return NextResponse.json(
      {
        message: `${totalDeleted} Property deleted successfully!`,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Deleting property finished.");
  }
}
