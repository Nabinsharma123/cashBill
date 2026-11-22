import { z } from "zod";
import { stringSchema } from "@/lib/zod";

export const partyFormSchema = z.object({
  name: stringSchema("Party name", 2, 200),
  address: stringSchema("Address", 3, 500),
  gstin: stringSchema("GSTIN", 15, 15),
  stateName: stringSchema("State name", 2, 100),
});

export type PartyFormSchemaType = z.infer<typeof partyFormSchema>;
