/**
 * /app/api/sysadmin/verifyer/route.ts
 */
import "dotenv/config";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
// import { writeFile } from "fs/promises";
// import path from "path";

const prisma = new PrismaClient().$extends(withAccelerate());

// const formatDate = (value: Date) => {
//   const parts = new Intl.DateTimeFormat("en-US", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",

//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,

//     timeZone: "Asia/Manila",
//   }).formatToParts(value);

//   const day = parts.find((p) => p.type === "day")?.value;
//   const month = parts.find((p) => p.type === "month")?.value;
//   const year = parts.find((p) => p.type === "year")?.value;

//   const hour = parts.find((p) => p.type === "hour")?.value;
//   const minute = parts.find((p) => p.type === "minute")?.value;
//   const second = parts.find((p) => p.type === "second")?.value;
//   //const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value;

//   return `${day}-${month}-${year}_${hour}${minute}${second}`;

//   //return `${day}-${month}-${year}`; // e.g. "10-Nov-2025"
// };

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("afirm[]") as File[];
  const parics = formData.get("parics") as string;

  // let counter = 0;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const madeDocs = [];

      let petsa = new Date().getTime();
      // Save metadata to DB
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // const filePath = path.join(
        //   process.cwd(),
        //   "uploads",
        //   file.name.replace(
        //     /\.(?=[^\.]+$)/,
        //     "_" + formatDate(new Date()) + String(counter++).padStart(2, "0") + "."
        //   )
        // );

        // await writeFile(filePath, buffer);
        const docu = await tx.documento.create({
          data: {
            icsareno: parseInt(parics, 10),
            petsaha: new Date(petsa++),
            filepath: file.name,
            filetype: file.type,
            physical: buffer,
          },
        });

        madeDocs.push(docu);
      }

      const mained = await tx.mrproperty.update({
        where: { icsareno: parseInt(parics, 10) },
        data: { verified: true },
      });
      return { madeDocs, mained };
    });

    // For demo: just log filenames
    const fileNames = files.map((file) => file.name);

    return NextResponse.json({
      message: "Files uploaded successfully!",
      files: fileNames,
      docs: result.madeDocs,
      main: result.mained,
    });
  } catch (e) {
    console.error("PPE Error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Post Verifyer finished.");
  }
}
