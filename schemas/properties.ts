import { z } from "zod";

// --- Define the Common Base ---
export const baseFields = z.object({
  icsareno: z.number().int().positive(),
  catdtld: z.string(),
  issued: z.string(),
  specifyd: z.string(),
  unitcost: z.number().positive(),
  acquired: z.number().int().positive(),
  uselife: z.number().int().positive(),
  property: z.string(),
});

export type Things = z.infer<typeof baseFields>;

export const baseEmps = z.object({
  empkey: z.string(),
  lname: z.string(),
  fname: z.string(),
  mname: z.string(),
  suffix: z.string(),
  ranggo: z.string(),
  offcid: z.string(),
  offcids: z.array(z.string()),
});

export type Employ = z.infer<typeof baseEmps>;
