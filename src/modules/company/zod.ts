import { z } from "zod";
import { stringSchema } from "@/lib/zod";

export const companyFormSchema = z.object({
  name: stringSchema("Company name", 2, 200),
  address: stringSchema("Address", 3, 500),
  gstin: stringSchema("GSTIN", 15, 15),
  stateName: stringSchema("State name", 2, 100),
});

export type CompanyFormSchemaType = z.infer<typeof companyFormSchema>;
