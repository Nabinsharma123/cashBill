import { GstType, QuantityUnit, TaxPreset } from "@/constants/enums";
import { numberSchema, stringSchema } from "@/lib/zod";
import { z } from "zod";

export const invoiceItemFormSchema = z.object({
  id: stringSchema("Item ID"),
  product: z.object(
    {
      id: numberSchema("Product ID"),
      name: stringSchema("Product Name", 1, 500),
    },
    {
      message: "Product is required",
    },
  ),
  quantity: numberSchema("Quantity").positive("Must be >0"),
  rate: numberSchema("Rate", 0),
  per: z.nativeEnum(QuantityUnit),
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
  company: z.object(
    {
      id: numberSchema("Company"),
      name: stringSchema("Company name"),
      address: stringSchema("Company address"),
      gstin: stringSchema("Company GSTIN", 1, 50),
      stateName: stringSchema("Company state", 1, 100),
    },
    {
      message: "Company is required",
    },
  ),

  party: z.object(
    {
      id: numberSchema("Party"),
      name: stringSchema("Party name"),
      address: stringSchema("Party address"),
      gstin: stringSchema("Party GSTIN", 1, 50),
      stateName: stringSchema("Party state", 1, 100),
    },
    {
      message: "Party is required",
    },
  ),
  items: z.array(invoiceItemFormSchema).min(1, "Add at least one product item"),
  taxPreset: z.nativeEnum(TaxPreset).default(TaxPreset.IGST_18),
  gstEntries: z.array(gstEntryFormSchema),
  roundOff: numberSchema("Round off"),
  transport: z
    .string()
    .trim()
    .max(200, "Transport can't be more than 200 characters long")
    .optional(),
  declaration: stringSchema("Declaration", 1, 500),
});

export type InvoiceFormSchemaType = z.infer<typeof invoiceFormSchema>;

export { TaxPreset };
