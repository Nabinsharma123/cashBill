import React from "react";
import { TInvoiceSchema } from "../schema";
import { InvoiceDocument } from "./InvoiceDocument";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface InvoiceViewModalProps {
  invoice: TInvoiceSchema["Doc"] | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onExportPdf: (filename: string) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPrint,
  onExportPdf,
}) => {
  if (!invoice) return null;

  const inv: any = invoice;
  let items: TInvoiceSchema["Item"][] = [];
  if (Array.isArray(inv.items)) {
    items = inv.items;
  } else if (typeof inv.items === "string") {
    try { items = JSON.parse(inv.items); } catch { items = []; }
  } else if (typeof inv.items_json === "string") {
    try { items = JSON.parse(inv.items_json); } catch { items = []; }
  }

  let gstEntries: TInvoiceSchema["GstEntry"][] = [];
  if (Array.isArray(inv.gstEntries)) {
    gstEntries = inv.gstEntries;
  } else if (typeof inv.gstEntries === "string") {
    try { gstEntries = JSON.parse(inv.gstEntries); } catch { gstEntries = []; }
  } else if (typeof inv.gst_entries_json === "string") {
    try { gstEntries = JSON.parse(inv.gst_entries_json); } catch { gstEntries = []; }
  }

  const invoiceNo = inv.invoiceNo || inv.invoice_no || "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 pr-6">
          <DialogTitle className="text-lg font-bold">
            Invoice #{invoiceNo} Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              size="sm"
              onClick={() => onExportPdf(`Invoice_${invoiceNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`)}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 bg-muted/20 rounded-md">
          <InvoiceDocument
            invoiceTitle={inv.invoiceTitle || inv.invoice_title}
            invoiceNo={invoiceNo}
            invoiceDate={inv.invoiceDate || inv.invoice_date}
            companyName={inv.companyName || inv.company_name}
            companyAddress={inv.companyAddress || inv.company_address}
            companyGstin={inv.companyGstin || inv.company_gstin}
            companyState={inv.companyStateName || inv.company_state_name}
            partyName={inv.partyName || inv.party_name}
            partyAddress={inv.partyAddress || inv.party_address}
            partyGstin={inv.partyGstin || inv.party_gstin}
            partyState={inv.partyStateName || inv.party_state_name}
            items={items}
            subtotal={Number(inv.subtotal) || 0}
            gstEntries={gstEntries}
            roundOff={Number(inv.roundOff ?? inv.round_off) || 0}
            totalAmount={Number(inv.totalAmount ?? inv.total_amount) || 0}
            totalQuantity={Number(inv.totalQuantity ?? inv.total_quantity) || 0}
            totalQuantityUnit={inv.totalQuantityUnit || inv.total_quantity_unit}
            declaration={inv.declaration}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
