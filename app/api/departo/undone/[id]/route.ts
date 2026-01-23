/**
 *  GET /app/api/departo/undone/[id]/route.ts
 */
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // const { id } = await params;

  // if (!id)
  //   return NextResponse.json({ error: "Missing offcid" }, { status: 400 });

  try {
    /*const undone = await prisma.mrproperty.findMany({
      where: {
        opesina: (await params).id,
        OR: [{ empkey: null }, { nagdawat: null }, { printed: false }],
      },
      include: {
        categories: true, // this joins with prc.categories
      },
      orderBy: {
        preparar: "asc", // ORDER BY mrproperty.preparar
      },
    });*/
    const undone = await prisma.$queryRaw<
      {
        icsareno: number;
        preparar: Date;
        gikanni: string;
        categoria: string;
      }[]
    >`SELECT 
        mrproperty.icsareno,
        mrproperty.preparar,
        mrproperty.gikanni,
        categories.categoria
      FROM ppe.mrproperty INNER JOIN prc.categories
        ON mrproperty.expcode = categories.cat_id
      WHERE
        (mrproperty.opesina = ${(await params).id}) AND
        ((mrproperty.empkey IS NULL) OR
         (mrproperty.nagdawat IS NULL) OR
         (mrproperty.printed = FALSE))
      ORDER BY mrproperty.preparar ASC;`;
    if (!undone)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });

    return NextResponse.json(
      undone.map((item) => ({
        icsareno: item.icsareno,
        preparar: item.preparar.getTime(),
        gikanni: item.gikanni === null,
        categoria: item.categoria,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Undone finished.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parics = parseInt(id, 10);
  try {
    const results = await prisma.$transaction([
      prisma.$executeRaw(
        Prisma.sql`DELETE FROM ppe.mritemize  WHERE (icsareno = ${parics});`
      ),
      prisma.$executeRaw(
        Prisma.sql`DELETE FROM ppe.mrdetalyes WHERE (icsareno = ${parics});`
      ),
      prisma.$executeRaw(
        Prisma.sql`DELETE FROM ppe.mrproperty WHERE (icsareno = ${parics});`
      ),
      prisma.$executeRaw(Prisma.sql`COMMIT;`), // Try adding an explicit commit
    ]);
    const totalDeleted = results.reduce((sum, count) => sum + count, 0);
    if (totalDeleted === 0) {
      return NextResponse.json(
        { error: `No receipt found with ICS/ARE ID ${parics}.` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: `Receipt ${parics} and ${totalDeleted} related records successfully deleted.`,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Append finished.");
  }
}
