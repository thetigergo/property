import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { receiptSchema, schemaTab1, schemaTab2 } from "@/schemas/receiptCase"; // Import the new schema
import { z } from "zod";
import { pool } from "@/libs/pgdb"; // Use the shared pool

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anios = searchParams.get("anios");
  const expcode = searchParams.get("expcode");
  const petsaha = searchParams.get("petsa");
  const typed = searchParams.get("type");
  if (!anios)
    return NextResponse.json(
      { error: "Missing 'anios' parameter" },
      { status: 400 },
    );

  try {
    if (anios && typed === "icsare") {
      const nahimo = parseInt(anios, 10);
      const bulana = parseInt(petsaha ? petsaha : "1", 10);
      const result = await pool.query<{ newicsare: string }>(
        `SELECT  
          CASE WHEN MAX(icsareno) IS NULL THEN
            TRIM(TO_CHAR(COALESCE(MAX(icsareno), 0) + 1, '0000')) 
          ELSE
            SUBSTRING((MAX(icsareno) + 1)::TEXT, 7) 
          END AS newIcsAre
        FROM
          ppe.mrproperty
        WHERE
          (DATE_PART('YEAR', preparar) = $1) AND
          (DATE_PART('MONTH', preparar) = $2);`,
        [nahimo, bulana],
      );
      const item = result.rows[0];
      return NextResponse.json({ icsareno: item.newicsare });
    } else if (expcode && anios) {
      const nahimo = parseInt(anios, 10);
      const result = await pool.query<{ seqno: number }>(
        `SELECT 
            COALESCE(MAX(mrdetalyes.lastseq), 0) as seqno
        FROM ppe.mrdetalyes INNER JOIN ppe.mrproperty
            ON mrdetalyes.icsareno = mrproperty.icsareno
        WHERE (mrproperty.expcode = $1) AND
            (DATE_PART('YEAR', mrdetalyes.acquired) = $2);`,
        [expcode, nahimo],
      );
      const item = result.rows[0];
      return NextResponse.json({ icsareno: item.seqno });
    } else if (anios && petsaha) {
      // Convert timestamp to Date object
      const timestamp = parseInt(petsaha, 10); // Parse the timestamp to a number
      if (isNaN(timestamp)) {
        return NextResponse.json(
          { message: "Invalid petsa format" },
          { status: 400 },
        );
      }
      const dateObject = new Date(timestamp);
      const result = await pool.query<{ icsare: string }>(
        "SELECT icsare FROM ppe.setparam WHERE ($1 BETWEEN frdate AND todate)",
        [dateObject],
      );

      const item = result.rows[0];
      return NextResponse.json({ icsareno: item.icsare });
    }
  } catch (e) {
    console.error("Database error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    console.log("Querying Append finished.");
  }
}

interface ItemizeData {
  property: string;
  peritems: string;
  icsareno: number;
  occurred: Date;
}
// function generateItemizeRecords(
//   kabtangan: string,
//   kabook: number,
//   nextno: number,
//   IcsAreNo: number,
//   offcCode: string,
// ): ItemizeData[] {
//   const oneByone = kabtangan.substring(0, 11) + "-";
//   const initialTimestamp = new Date().getTime();

//   // Create a new array using Array.from and map for the loop
//   const recordsArray = Array.from({ length: kabook }, (_, index) => {
//     // 1. Generate the sequential number (Java's DecimalFormat("0000"))
//     const currentSequence = nextno + index;
//     // 💡 Note: Using a DecimalFormat library or custom padding function is needed
//     // to replicate the '0000' formatting accurately in TypeScript.
//     const numero = String(currentSequence).padStart(4, "0");

//     // 2. Calculate the unique peritems code
//     const peritems = oneByone + numero + "-" + offcCode;

//     // 3. Calculate the unique timestamp (by incrementing the milliseconds)
//     const occurredDate = new Date(initialTimestamp + index);

//     return {
//       property: kabtangan,
//       peritems: peritems,
//       icsareno: IcsAreNo,
//       occurred: occurredDate,
//     };
//   });
//   return recordsArray;
// }
// 1. IMPROVED GENERATOR
function generateItemizeRecords(
  kabtangan: string,
  kabook: number,
  nextno: number,
  icsAreNo: number, // Use camelCase consistently
  offcCode: string,
): ItemizeData[] {
  // Ensure we don't crash if string is short
  const prefix =
    kabtangan.length >= 11 ? kabtangan.substring(0, 11) : kabtangan;
  const oneByone = `${prefix}-`;
  const initialTimestamp = Date.now();

  return Array.from({ length: kabook }, (_, index) => {
    const numero = String(nextno + index).padStart(4, "0");
    const peritems = `${oneByone}${numero}-${offcCode}`;

    return {
      property: kabtangan,
      peritems: peritems,
      icsareno: icsAreNo,
      occurred: new Date(initialTimestamp + index),
    };
  });
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
      { status: 400 },
    );
  }

  const { activo, ...data } = validation.data;

  const client = await pool.connect();
  try {
    // 🔑 Key: Use the $transaction method

    // 1. Transaction BEGINs automatically here.
    await client.query("BEGIN"); // Start the transaction

    if (activo === 0) {
      // TypeScript now knows 'data' contains all fields from schemaTab1
      const tab1Data = data as z.infer<typeof schemaTab1>;

      // ➡️ OPERATION 1: Create the main receipt record
      const mainRecord = await client.query(
        "SELECT icsareno FROM ppe.mrproperty WHERE (icsareno = $1)",
        [tab1Data.icsareno],
      );
      if (mainRecord.rowCount === 0) {
        const petsa = new Date(tab1Data.preparar).getTime();
        const maked = petsa + 24 * 60 * 60 * 1000; // Add 1 day in milliseconds
        await client.query(
          "INSERT INTO ppe.mrproperty (icsareno, preparar, opesina, expcode, user_id) VALUES ($1, $2, $3, $4, $5);",
          [
            tab1Data.icsareno,
            maked ? new Date(maked) : new Date(),
            tab1Data.opesina,
            tab1Data.expcode,
            tab1Data.userid,
          ],
        );
      }

      // ➡️ OPERATION 2: Update the related inventory count
      // This operation depends on the success of the first one.
      const petsa = new Date(tab1Data.acquired).getTime();
      const nakuha = petsa + 24 * 60 * 60 * 1000; // Add 1 day in milliseconds
      await client.query(
        "INSERT INTO ppe.mrdetalyes (icsareno, catdtld, quantiy, issued, specifyd, unitcost, itemno, acquired, uselife, property, acronyear, lastseq, acknowledge) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);",
        [
          tab1Data.icsareno,
          tab1Data.catdetl,
          tab1Data.kabook,
          tab1Data.prefixed,
          tab1Data.specific,
          tab1Data.costing ?? 0,
          0,
          nakuha ? new Date(nakuha) : new Date(),
          tab1Data.lifespan,
          tab1Data.butang,
          tab1Data.acronym,
          tab1Data.lastseq,
          tab1Data.thresh,
        ],
      );

      /*const detailsArray = generateItemizeRecords(
        tab1Data.butang,
        tab1Data.kabook,
        tab1Data.lastseq - tab1Data.kabook + 1,
        tab1Data.icsareno,
        tab1Data.acronym.substring(0, 3),
      );*/
      // 2. THE CORRECTED QUERY LOGIC
      const detailsArray = generateItemizeRecords(
        tab1Data.butang,
        tab1Data.kabook,
        tab1Data.lastseq - tab1Data.kabook + 1,
        tab1Data.icsareno,
        tab1Data.acronym.substring(0, 3),
      );

      // 2. Perform the bulk insert using the transaction client (tx)
      /*const itemizeResult = await tx.mritemize.createMany({
        data: detailsArray,
      });*/
      /**
       * To insert multiple rows, we map the objects to a flat array
       * and build a string like ($1, $2, $3, $4), ($5, $6, $7, $8)...
       */
      const values: (string | number | Date)[] = [];
      const placeholders = detailsArray
        .map((_, i) => {
          const offset = i * 4;
          values.push(_.property, _.peritems, _.icsareno, _.occurred);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
        })
        .join(",");
      /*const itemizeResult = await client.query(
        "INSERT INTO ppe.mritemize (property, peritems, icsareno, occurred) VALUES ($1, $2, $3, $4);",
        detailsArray.map((record) => [
          record.property,
          record.peritems,
          record.icsareno,
          record.occurred,
        ]),
      );*/
      const queryText = `INSERT INTO ppe.mritemize (property, peritems, icsareno, occurred) VALUES ${placeholders};`;
      await client.query(queryText, values);

      // Explicitly commit the transaction
      await client.query("COMMIT");
    } else {
      const tab2Data = data as z.infer<typeof schemaTab2>;

      await client.query("BEGIN"); // Start a new transaction for the update
      await client.query(
        "UPDATE ppe.mrproperty SET empkey = $1, designate = $2, details = $3, nagdawat = $4, ranggo = $5 WHERE (icsareno = $6);",
        [
          tab2Data.empkey,
          tab2Data.designate,
          tab2Data.details,
          tab2Data.nagdawat,
          tab2Data.ranggo,
          /** ------------- */
          tab2Data.icsareno,
        ],
      );
      await client.query("COMMIT"); // Commit the update transaction
      // return { centro: mainRecord };
    }

    // Send a success response back to the client
    return NextResponse.json({
      message: "Transaction completed successfully.",
      status: 201,
    });
  } catch (error) {
    // This block catches the error thrown inside $transaction,
    // confirming the ROLLBACK.
    await client.query("ROLLBACK"); // Rollback the transaction on error
    console.error("Transaction failed and was rolled back:", error);

    return NextResponse.json(
      {
        error:
          (error as Error).message ||
          "Transaction failed due to an unknown error.",
      },
      { status: 400 },
    );
  } finally {
    client.release(); // Release the client back to the pool
    console.log("Transaction process finished.");
  }
}
