import { z } from "zod";
import { GstType, QuantityUnit, TaxPreset } from "@/constants/enums";

export const invoiceItemFormSchema = z.object({
  id: z.string(),
  slNo: z.number().min(1),
  productId: z.number().nullable().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rate: z.coerce.number().min(0, "Rate must be 0 or positive"),
  per: z.string().min(1, "Unit is required"),
  amount: z.coerce.number().min(0),
});

export type InvoiceItemFormSchemaType = z.infer<typeof invoiceItemFormSchema>;

export const gstEntryFormSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(GstType),
  rate: z.coerce.number(),
  amount: z.coerce.number().min(0),
});

export type GstEntryFormSchemaType = z.infer<typeof gstEntryFormSchema>;

export const invoiceFormSchema = z.object({
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceTitle: z.string().min(1, "Invoice title is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  companyId: z.coerce.number({ required_error: "Please select a Company" }).positive("Please select a Company"),
  partyId: z.coerce.number({ required_error: "Please select a Party" }).positive("Please select a Party"),
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyGstin: z.string().min(1, "Company GSTIN is required"),
  companyStateName: z.string().min(1, "Company state is required"),
  partyName: z.string().min(1, "Party name is required"),
  partyAddress: z.string().min(1, "Party address is required"),
  partyGstin: z.string().min(1, "Party GSTIN is required"),
  partyStateName: z.string().min(1, "Party state is required"),
  items: z.array(invoiceItemFormSchema).min(1, "Add at least one product item"),
  taxPreset: z.nativeEnum(TaxPreset).default(TaxPreset.IGST_18),
  gstEntries: z.array(gstEntryFormSchema),
  roundOff: z.coerce.number().default(0),
  totalQuantityUnit: z.nativeEnum(QuantityUnit),
  declaration: z.string().optional(),
});

export type InvoiceFormSchemaType = z.infer<typeof invoiceFormSchema>;

export { TaxPreset };
