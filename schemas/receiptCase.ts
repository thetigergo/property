// src/schemas/receiptSchema.ts
import { z } from "zod";

// --- 1. Define the Common Base ---
const baseFields = z.object({
  icsareno: z.number().int().positive(),
  // activo: z.number().int().positive(),
});

// --- 2. Define Schema for Tab 1 (activo: 0) ---
// Note: We use .merge() instead of safeExtend for a single schema definition
export const schemaTab1 = baseFields.extend({
  // The discriminator field MUST be literal (const/readonly)
  activo: z.literal(0),

  // Fields required when activo === 0
  preparar: z.number().int().positive(),
  opesina: z.string().min(1, "Opesina is required."),
  expcode: z.string(),
  userid: z.string(),

  catdetl: z.string(),
  kabook: z.number().int().positive(),
  prefixed: z.string(),
  specific: z.string(),
  costing: z.number().positive(), // Allowing decimals as discussed
  acquired: z.number().int().positive(),
  lifespan: z.number().int().positive(),
  butang: z.string(),
  acronym: z.string(),
  lastseq: z.number().int().positive(),
  thresh: z.number().positive(),
});

// --- 3. Define Schema for Tab 2 (activo: 1) ---
export const schemaTab2 = baseFields.extend({
  // The discriminator field MUST be literal (const/readonly)
  activo: z.literal(1),

  // Fields required when activo === 1
  empkey: z.string(),
  designate: z.string(),
  details: z.string(),
  nagdawat: z.string(),
  ranggo: z.string(),
});

// --- 4. The Final Schema (Discriminated Union) ---
export const receiptSchema = z.discriminatedUnion("activo", [
  schemaTab1,
  schemaTab2,
]);

// --- 5. TypeScript Type ---
// Use the final union to infer the type, which will be a union of the two tab types.
export type ReceiptPayload = z.infer<typeof receiptSchema>;
