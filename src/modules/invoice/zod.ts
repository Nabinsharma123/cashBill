import { GstType, TaxPreset } from "@/constants/enums";
import { numberSchema, stringSchema } from "@/lib/zod";
import { z } from "zod";

export const invoiceItemFormSchema = z.object({
  id: stringSchema("Item ID"),
  productId: numberSchema("Product ID"),
  productName: stringSchema("Product Name", 1, 500),
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
  companyId: numberSchema("Company"),
  partyId: numberSchema("Party"),
  companyName: stringSchema("Company name"),
  companyAddress: stringSchema("Company address"),
  companyGstin: stringSchema("Company GSTIN", 1, 50),
  companyStateName: stringSchema("Company state", 1, 100),
  partyName: stringSchema("Party name"),
  partyAddress: stringSchema("Party address"),
  partyGstin: stringSchema("Party GSTIN", 1, 50),
  partyStateName: stringSchema("Party state", 1, 100),
  items: z.array(invoiceItemFormSchema).min(1, "Add at least one product item"),
  taxPreset: z.nativeEnum(TaxPreset).default(TaxPreset.IGST_18),
  gstEntries: z.array(gstEntryFormSchema),
  roundOff: numberSchema("Round off"),
  declaration: stringSchema("Declaration", 1, 500),
});

export type InvoiceFormSchemaType = z.infer<typeof invoiceFormSchema>;

export { TaxPreset };
