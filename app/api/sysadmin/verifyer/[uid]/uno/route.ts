/**
 * GET /app/api/sysadmin/verifyer/[uid]/uno/route.ts
 * Retrieves uploaded documents associated with a specific verifyee.
 */
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const upload = await prisma.documento.findMany({
      where: { icsareno: Number((await params).uid) },
      select: {
        physical: true,
        filepath: true,
        filetype: true,
      },
    });

    if (!upload || upload.length === 0)
      return new Response("Not found", { status: 404 });

    // Convert Buffers to base64 so JSON can carry them
    // Convert Buffer → base64 string
    const result = upload.map((blob) => ({
      filepath: blob.filepath,
      filetype: blob.filetype,
      physical: Buffer.from(blob.physical as Uint8Array).toString("base64"),
    }));

    return Response.json(result);
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Retrieve Verifyer finished.");
  }
}
