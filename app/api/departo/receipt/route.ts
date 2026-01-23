import "dotenv/config";
import { PrismaClient, Prisma } from "@generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { receiptSchema, schemaTab1, schemaTab2 } from "@/schemas/receiptCase"; // Import the new schema
import { z } from "zod";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anios = searchParams.get("anios");
  const expcode = searchParams.get("expcode");
  const petsaha = searchParams.get("petsa");
  const typed = searchParams.get("type");
  if (!anios)
    return NextResponse.json(
      { error: "Missing 'anios' parameter" },
      { status: 400 }
    );
  try {
    if (anios && typed === "icsare") {
      const nahimo = parseInt(anios, 10);
      const result = await prisma.$queryRaw<{ newicsare: string }[]>(Prisma.sql`
                                SELECT  
                                  CASE WHEN MAX(icsareno) IS NULL THEN
                                    TRIM(TO_CHAR(COALESCE(MAX(icsareno), 0) + 1, '0000')) 
                                  ELSE
                                    SUBSTRING((MAX(icsareno) + 1)::TEXT, 7) 
                                  END AS newIcsAre
                                FROM
                                  ppe.mrproperty
                                WHERE
                                  DATE_PART('YEAR', preparar) = ${nahimo};`);
      const item = result[0];
      return NextResponse.json({ icsareno: item.newicsare });
    } else if (expcode && anios) {
      const nahimo = parseInt(anios, 10);
      const result = await prisma.$queryRaw<{ seqno: number }[]>(Prisma.sql`
                                SELECT COALESCE(MAX(mrdetalyes.lastseq), 0) as seqno
                                FROM ppe.mrdetalyes INNER JOIN ppe.mrproperty
                                     ON mrdetalyes.icsareno = mrproperty.icsareno
                                WHERE (mrproperty.expcode = ${expcode}) AND
                                      (DATE_PART('YEAR', mrdetalyes.acquired) =  ${nahimo});`);
      const item = result[0];
      return NextResponse.json({ icsareno: item.seqno });
    } else if (anios && petsaha) {
      // Convert timestamp to Date object
      const timestamp = parseInt(petsaha, 10); // Parse the timestamp to a number
      if (isNaN(timestamp)) {
        return NextResponse.json(
          { message: "Invalid petsa format" },
          { status: 400 }
        );
      }
      const dateObject = new Date(timestamp);
      const result = await prisma.setparam.findMany({
        where: {
          AND: { frdate: { lte: dateObject }, todate: { gte: dateObject } },
        },
        select: { icsare: true },
      });
      const item = result[0];
      return NextResponse.json({ icsareno: item.icsare });
    }
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("Querying Append finished.");
  }
}

interface ItemizeData {
  property: string;
  peritems: string;
  icsareno: number;
  occurred: Date;
}
function generateItemizeRecords(
  kabtangan: string,
  kabook: number,
  nextno: number,
  IcsAreNo: number,
  offcCode: string
): ItemizeData[] {
  const oneByone = kabtangan.substring(0, 11) + "-";
  const initialTimestamp = new Date().getTime();

  // Create a new array using Array.from and map for the loop
  const recordsArray = Array.from({ length: kabook }, (_, index) => {
    // 1. Generate the sequential number (Java's DecimalFormat("0000"))
    const currentSequence = nextno + index;
    // 💡 Note: Using a DecimalFormat library or custom padding function is needed
    // to replicate the '0000' formatting accurately in TypeScript.
    const numero = String(currentSequence).padStart(4, "0");

    // 2. Calculate the unique peritems code
    const peritems = oneByone + numero + "-" + offcCode;

    // 3. Calculate the unique timestamp (by incrementing the milliseconds)
    const occurredDate = new Date(initialTimestamp + index);

    return {
      property: kabtangan,
      peritems: peritems,
      icsareno: IcsAreNo,
      occurred: occurredDate,
    };
  });
  return recordsArray;
}
export async function POST(req: NextRequest) {
  const body = await req.json();

  // 🔑 Key: Validate the body against the Zod schema
  const validation = receiptSchema.safeParse(body);
  if (!validation.success) {
    // If validation fails (e.g., icsareNo is not a number, or key name is wrong)
    console.error("Validation Error:", validation.error.issues);
    return NextResponse.json(
      { error: "Invalid payload data.", details: validation.error.issues },
      { status: 400 }
    );
  }

  const { activo, ...data } = validation.data;
  try {
    // 🔑 Key: Use the $transaction method
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transaction BEGINs automatically here.

      if (activo === 0) {
        // TypeScript now knows 'data' contains all fields from schemaTab1
        const tab1Data = data as z.infer<typeof schemaTab1>;

        // ➡️ OPERATION 1: Create the main receipt record
        let mainRecord = await tx.mrproperty.findUnique({
          where: { icsareno: tab1Data.icsareno },
        });
        if (!mainRecord) {
          mainRecord = await tx.mrproperty.create({
            data: {
              icsareno: tab1Data.icsareno,
              preparar: new Date(tab1Data.preparar),
              opesina: tab1Data.opesina,
              expcode: tab1Data.expcode,
              user_id: tab1Data.userid,
            },
          });
        }

        // ➡️ OPERATION 2: Update the related inventory count
        // This operation depends on the success of the first one.
        const detailRecord = await tx.mrdetalyes.create({
          data: {
            icsareno: tab1Data.icsareno,
            catdtld: tab1Data.catdetl,
            quantiy: tab1Data.kabook,
            issued: tab1Data.prefixed,
            specifyd: tab1Data.specific,
            unitcost: tab1Data.costing ?? 0,
            itemno: 0,
            acquired: tab1Data.acquired
              ? new Date(tab1Data.acquired)
              : new Date(),
            uselife: tab1Data.lifespan,
            property: tab1Data.butang,
            acronyear: tab1Data.acronym,
            lastseq: tab1Data.lastseq,
            acknowledge: tab1Data.thresh,
          },
        });

        const detailsArray = generateItemizeRecords(
          tab1Data.butang,
          tab1Data.kabook,
          tab1Data.lastseq - tab1Data.kabook + 1,
          tab1Data.icsareno,
          tab1Data.acronym.substring(0, 3)
        );

        // 2. Perform the bulk insert using the transaction client (tx)
        const itemizeResult = await tx.mritemize.createMany({
          data: detailsArray,
        });

        // 3. Transaction COMMITs automatically here if no errors were thrown.

        // Return data from the transaction block
        return {
          centro: mainRecord,
          detail: detailRecord,
          itemize: itemizeResult.count,
        };
      } else {
        const tab2Data = data as z.infer<typeof schemaTab2>;
        const mainRecord = await tx.mrproperty.update({
          where: { icsareno: tab2Data.icsareno },
          data: {
            empkey: tab2Data.empkey,
            designate: tab2Data.designate,
            details: tab2Data.details,
            nagdawat: tab2Data.nagdawat,
            ranggo: tab2Data.ranggo,
          },
        });
        return { centro: mainRecord };
      }
    });

    // Send a success response back to the client
    return NextResponse.json(
      {
        message: "Transaction completed successfully.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    // This block catches the error thrown inside $transaction,
    // confirming the ROLLBACK.
    console.error("Transaction failed and was rolled back:", error);

    return NextResponse.json(
      {
        error:
          (error as Error).message ||
          "Transaction failed due to an unknown error.",
      },
      { status: 400 }
    );
  }
}
