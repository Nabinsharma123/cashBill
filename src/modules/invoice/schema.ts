import { GstRate, GstType, InvoiceTitle, TaxPreset } from "@/constants/enums";

export type TInvoiceSchema = {
  Doc: {
    id: number;
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
    transport?: string | null;
    declaration: string;
    createdAt?: string;
  };

  Preview: {
    invoiceNo: string;
    invoiceTitle: string;
    invoiceDate: string;
    subtotal: number;
    totalAmount: number;
    company: {
      id: number;
      name: string;
      address: string;
      gstin: string;
      stateName: string;
    };
    party: {
      id: number;
      name: string;
      address: string;
      gstin: string;
      stateName: string;
    };
    items: {
      id: string;
      product: {
        id: number;
        name: string;
      };
      quantity: number;
      rate: number;
      per: string;
      amount: number;
    }[];

    gstEntries: {
      type: GstType;
      id: string;
      rate: number;
      amount: number;
    }[];
    roundOff: number;
    transport?: string;
    declaration: string;
  };

  Item: {
    id: string;
    productId: number;
    productName: string;
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
    transport?: string;
    declaration: string;
  };
};

export { GstRate, GstType, InvoiceTitle, TaxPreset };
