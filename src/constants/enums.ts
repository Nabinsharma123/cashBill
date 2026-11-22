/**
 * Centralized Enums and Dropdown Options for CashBill
 */

// 1. Invoice Document Titles
export enum InvoiceTitle {
  PROFORMA = "PROFORMA INVOICE",
  TAX = "TAX INVOICE",
  COMMERCIAL = "COMMERCIAL INVOICE",
}

export const INVOICE_TITLE_OPTIONS = [
  { value: InvoiceTitle.PROFORMA, label: "PROFORMA INVOICE" },
  { value: InvoiceTitle.TAX, label: "TAX INVOICE" },
  { value: InvoiceTitle.COMMERCIAL, label: "COMMERCIAL INVOICE" },
] as const;

// 2. GST Types
export enum GstType {
  IGST = "IGST",
  CGST = "CGST",
  SGST = "SGST",
  GST = "GST",
}

export const GST_TYPE_OPTIONS = [
  { value: GstType.IGST, label: "IGST" },
  { value: GstType.CGST, label: "CGST" },
  { value: GstType.SGST, label: "SGST" },
  { value: GstType.GST, label: "GST" },
] as const;

// 3. GST Tax Rates
export enum GstRate {
  RATE_0 = 0,
  RATE_5 = 5,
  RATE_9 = 9,
  RATE_12 = 12,
  RATE_18 = 18,
  RATE_28 = 28,
}

export const GST_RATE_OPTIONS = [
  { value: GstRate.RATE_0, label: "0%" },
  { value: GstRate.RATE_5, label: "5%" },
  { value: GstRate.RATE_9, label: "9%" },
  { value: GstRate.RATE_12, label: "12%" },
  { value: GstRate.RATE_18, label: "18%" },
  { value: GstRate.RATE_28, label: "28%" },
] as const;

// 4. Total Quantity Units (strictly restricted to PCE, SET, BOX, BUNDLE)
export enum QuantityUnit {
  SET = "SET",
  PCE = "PCE",
  BOX = "BOX",
  BUNDLE = "BUNDLE",
}

export const QUANTITY_UNIT_OPTIONS = [
  { value: QuantityUnit.SET, label: "SET" },
  { value: QuantityUnit.PCE, label: "PCE" },
  { value: QuantityUnit.BOX, label: "BOX" },
  { value: QuantityUnit.BUNDLE, label: "BUNDLE" },
] as const;

// 5. Tax Preset Radio Options
export enum TaxPreset {
  IGST_18 = "IGST_18",
  CGST_SGST_9 = "CGST_SGST_9",
  CUSTOM = "CUSTOM",
}

export const TAX_PRESET_OPTIONS = [
  { value: TaxPreset.IGST_18, label: "IGST 18% (Inter-State)" },
  { value: TaxPreset.CGST_SGST_9, label: "CGST 9% + SGST 9% (Intra-State)" },
  { value: TaxPreset.CUSTOM, label: "Custom GST Entries" },
] as const;

// 6. Navigation Tabs
export enum NavTab {
  CREATE_INVOICE = "create-invoice",
  INVOICE_HISTORY = "invoice-history",
  COMPANIES = "companies",
  PARTIES = "parties",
  PRODUCTS = "products",
}

// 7. Invoice View Tabs (Editor layout)
export enum InvoiceTab {
  FORM = "form",
  PREVIEW = "preview",
  SPLIT = "split",
}

// 8. Alert Dialog Variants
export enum AlertVariant {
  WARNING = "warning",
  DESTRUCTIVE = "destructive",
  SUCCESS = "success",
  INFO = "info",
}

