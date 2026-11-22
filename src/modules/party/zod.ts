import { z } from "zod";

export const partyFormSchema = z.object({
  name: z.string().min(2, "Party name must be at least 2 characters"),
  address: z.string().min(3, "Address is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
  stateName: z.string().min(2, "State name (and code) is required"),
});

export type PartyFormSchemaType = z.infer<typeof partyFormSchema>;
