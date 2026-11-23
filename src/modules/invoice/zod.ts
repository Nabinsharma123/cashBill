import { GstType, TaxPreset } from "@/constants/enums";
import { numberSchema, stringSchema } from "@/lib/zod";
import { z } from "zod";

export const invoiceItemFormSchema = z.object({
  id: stringSchema("Item ID"),
  slNo: numberSchema("Serial No", 1),
  productId: numberSchema("Product ID").nullable().optional(),
  description: stringSchema("Description", 1, 500),
  quantity: numberSchema("Quantity").positive(
    "Quantity must be greater than 0",
  ),
  rate: numberSchema("Rate", 0),
  per: stringSchema("Unit", 1, 50),
  amount: numberSchema("Amount", 0),
});

export type InvoiceItemFormSchemaType = z.infer<typeof invoiceItemFormSchema>;

export const gstEntryFormSchema = z.object({
  id: stringSchema("GST Entry ID"),
  type: z.nativeEnum(GstType),
  rate: numberSchema("GST Rate", 0),
  amount: numberSchema("GST Amount", 0),
});

export type GstEntryFormSchemaType = z.infer<typeof gstEntryFormSchema>;

export const invoiceFormSchema = z.object({
  invoiceNo: stringSchema("Invoice number", 1, 100),
  invoiceTitle: stringSchema("Invoice title", 1, 100),
  invoiceDate: stringSchema("Date", 1, 50),
  companyId: numberSchema("Company").positive("Please select a Company"),
  partyId: numberSchema("Party").positive("Please select a Party"),
  companyName: stringSchema("Company name", 1, 200),
  companyAddress: stringSchema("Company address", 1, 500),
  companyGstin: stringSchema("Company GSTIN", 1, 50),
  companyStateName: stringSchema("Company state", 1, 100),
  partyName: stringSchema("Party name", 1, 200),
  partyAddress: stringSchema("Party address", 1, 500),
  partyGstin: stringSchema("Party GSTIN", 1, 50),
  partyStateName: stringSchema("Party state", 1, 100),
  items: z.array(invoiceItemFormSchema).min(1, "Add at least one product item"),
  taxPreset: z.nativeEnum(TaxPreset).default(TaxPreset.IGST_18),
  gstEntries: z.array(gstEntryFormSchema),
  roundOff: numberSchema("Round off").default(0),
  declaration: stringSchema("Declaration", 0, 1000).optional(),
});

export type InvoiceFormSchemaType = z.infer<typeof invoiceFormSchema>;

export { TaxPreset };
