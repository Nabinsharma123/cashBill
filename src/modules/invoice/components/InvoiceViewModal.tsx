import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoiceModalMode } from "@/constants/enums";
import { Download, Printer, Save } from "lucide-react";
import React from "react";
import { TInvoiceSchema } from "../schema";
import { InvoiceDocument } from "./InvoiceDocument";

export { InvoiceModalMode };

export interface InvoiceViewModalProps {
  invoice: TInvoiceSchema["Preview"];
  isOpen: boolean;
  onClose: () => void;
  type?: InvoiceModalMode | "Preview" | "previewWithSave" | "PreviewWithPrint";
  onPrint?: () => void;
  onExportPdf?: (filename: string) => void;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  type = InvoiceModalMode.PREVIEW_WITH_PRINT,
  onPrint,
  onExportPdf,
  onSave,
  isSaving = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 pr-6">
          <DialogTitle className="text-lg font-bold">
            Invoice #{invoice?.invoiceNo} Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* Mode 1: Preview Only - no print, no download */}
            {type === InvoiceModalMode.PREVIEW && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs"
              >
                Close
              </Button>
            )}

            {/* Mode 2: Preview with Save */}
            {type === InvoiceModalMode.PREVIEW_WITH_SAVE && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSaving}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="h-8 text-xs flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save Invoice"}
                </Button>
              </div>
            )}

            {/* Mode 3: Preview with Print & Download */}
            {type === InvoiceModalMode.PREVIEW_WITH_PRINT && (
              <div className="flex items-center gap-2">
                {onPrint && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    className="h-8 text-xs flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                )}
                {onExportPdf && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      onExportPdf(
                        `Invoice_${invoice?.invoiceNo?.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
                      )
                    }
                    className="h-8 text-xs flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="py-4 bg-muted/20 rounded-md">
          <InvoiceDocument invoice={invoice} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
