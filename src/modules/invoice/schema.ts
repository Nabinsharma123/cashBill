import { GstType, GstRate, InvoiceTitle, TaxPreset } from "@/constants/enums";

export type TInvoiceSchema = {
  Doc: {
    id: number;
    invoiceNo: string;
    invoiceTitle: string;
    invoiceDate: string;
    companyId: number | null;
    partyId: number | null;
    companyName: string;
    companyAddress: string;
    companyGstin: string;
    companyStateName: string;
    partyName: string;
    partyAddress: string;
    partyGstin: string;
    partyStateName: string;
    items: TInvoiceSchema["Item"][];
    subtotal: number;
    gstEntries: TInvoiceSchema["GstEntry"][];
    roundOff: number;
    totalAmount: number;
    totalQuantity: number;
    declaration: string;
    createdAt?: string;
  };

  Item: {
    id: string;
    slNo: number;
    productId?: number | null;
    description: string;
    quantity: number;
    rate: number;
    per: string;
    amount: number;
  };

  GstEntry: {
    id: string;
    type: GstType;
    rate: GstRate;
    amount: number;
  };

  CreatePayload: {
    invoiceNo: string;
    invoiceTitle: string;
    invoiceDate: string;
    companyId: number;
    partyId: number;
    companyName: string;
    companyAddress: string;
    companyGstin: string;
    companyStateName: string;
    partyName: string;
    partyAddress: string;
    partyGstin: string;
    partyStateName: string;
    items: TInvoiceSchema["Item"][];
    subtotal: number;
    gstEntries: TInvoiceSchema["GstEntry"][];
    roundOff: number;
    totalAmount: number;
    totalQuantity: number;
    declaration: string;
  };
};

export { GstType, GstRate, InvoiceTitle, TaxPreset };
