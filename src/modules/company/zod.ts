import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(3, "Address is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
  stateName: z.string().min(2, "State name (and code) is required"),
});

export type CompanyFormSchemaType = z.infer<typeof companyFormSchema>;
