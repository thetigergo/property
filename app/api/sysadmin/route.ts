/**
 *  /app/api/sysadmin/route.ts
 */
import "dotenv/config";
import { /*NextRequest,*/ NextResponse } from "next/server";
import { PrismaClient /*, Prisma*/ } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = await params;
//   const parics = parseInt(id);
//   try {
//     const results = await prisma.$transaction([
//       prisma.$executeRaw(
//         Prisma.sql`DELETE FROM ppe.mritemize  WHERE (icsareno = ${parics});`
//       ),
//       prisma.$executeRaw(
//         Prisma.sql`DELETE FROM ppe.mrdetalyes WHERE (icsareno = ${parics});`
//       ),
//       prisma.$executeRaw(
//         Prisma.sql`DELETE FROM ppe.mrproperty WHERE (icsareno = ${parics});`
//       ),
//       prisma.$executeRaw(Prisma.sql`COMMIT;`), // Try adding an explicit commit
//     ]);
//     const totalDeleted = results.reduce((sum, count) => sum + count, 0);
//     if (totalDeleted === 0) {
//       return NextResponse.json(
//         { error: `No receipt found with ICS/ARE ID ${parics}.` },
//         { status: 404 }
//       );
//     }
//     return NextResponse.json(
//       {
//         message: `Receipt ${parics} and ${totalDeleted} related records successfully deleted.`,
//       },
//       { status: 200 }
//     );
//   } catch (e) {
//     console.error("Prisma error:", e);
//     return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//     console.log("Querying Append finished.");
//   }
// }

export async function GET() {
  try {
    const result = await prisma.$queryRaw<
      {
        ngalan: string;
        categoria: string;
        opesina: string;
        offcid: string;
        preparar: Date;
        icsareno: number;
      }[]
    >`SELECT
        humane(employees.lname, employees.fname, employees.mname, employees.suffix) as ngalan,  
        categories.categoria,  
        offices.opesina,  
        offices.offcid,  
        mrproperty.preparar,  
        mrproperty.icsareno  
      FROM
        ppe.mrproperty INNER JOIN ppe.employees  
        ON mrproperty.empkey = employees.empkey  
        INNER JOIN prc.offices ON mrproperty.opesina = offices.offcid  
        INNER JOIN prc.categories ON mrproperty.expcode = categories.cat_id  
      WHERE  
        (NOT mrproperty.verified)  
      ORDER BY  
        mrproperty.preparar DESC;`;

    if (!result || result.length === 0)
      return NextResponse.json(
        { error: "Record not found", data: [] },
        { status: 205 }
      );
    return NextResponse.json(
      result.map((item) => ({
        ngalan: item.ngalan,
        categoria: item.categoria,
        opesina: item.opesina,
        offcid: item.offcid,
        preparar: item.preparar.getTime(),
        paricsno: item.icsareno,
      }))
    );
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Query Unproven finished.");
  }
}
