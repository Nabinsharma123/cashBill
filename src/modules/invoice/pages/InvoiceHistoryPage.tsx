import React, { useState } from "react";
import { useGetAllInvoices, useDeleteInvoice } from "../hooks";
import { TInvoiceSchema } from "../schema";
import { InvoiceViewModal } from "../components/InvoiceViewModal";
import { useAlert } from "@/context/AlertDialogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatINR, formatDateDisplay } from "@/lib/utils";
import {
  Search,
  FileText,
  Eye,
  Printer,
  Download,
  Trash2,
  Plus,
  TrendingUp,
  Receipt,
  Boxes,
} from "lucide-react";

interface InvoiceHistoryPageProps {
  onNavigateCreate: () => void;
}

export const InvoiceHistoryPage: React.FC<InvoiceHistoryPageProps> = ({ onNavigateCreate }) => {
  const { data: invoices = [], isLoading } = useGetAllInvoices();
  const deleteInvoiceMutation = useDeleteInvoice();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<TInvoiceSchema["Doc"] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { showConfirm, showAlert } = useAlert();

  const filteredInvoices = invoices.filter((inv) => {
    const invNo = inv.invoiceNo || (inv as any).invoice_no || "";
    const partyName = inv.partyName || (inv as any).party_name || "";
    const compName = inv.companyName || (inv as any).company_name || "";
    const invDate = inv.invoiceDate || (inv as any).invoice_date || "";
    const search = searchTerm.toLowerCase();

    return (
      invNo.toLowerCase().includes(search) ||
      partyName.toLowerCase().includes(search) ||
      compName.toLowerCase().includes(search) ||
      invDate.toLowerCase().includes(search)
    );
  });

  const totalRevenue = invoices.reduce(
    (acc, inv) => acc + (Number(inv.totalAmount ?? (inv as any).total_amount) || 0),
    0
  );
  const totalQty = invoices.reduce(
    (acc, inv) => acc + (Number(inv.totalQuantity ?? (inv as any).total_quantity) || 0),
    0
  );

  const handleOpenView = (inv: TInvoiceSchema["Doc"]) => {
    setSelectedInvoice(inv);
    setIsViewModalOpen(true);
  };

  const handlePrint = async () => {
    try {
      if (window.electronAPI?.printInvoice) {
        await window.electronAPI.printInvoice();
      } else {
        window.print();
      }
    } catch (err: any) {
      console.error("Print failed:", err);
      window.print();
    }
  };

  const handleExportPdf = async (filename?: string) => {
    try {
      const invNo = selectedInvoice ? (selectedInvoice.invoiceNo || (selectedInvoice as any).invoice_no) : "Invoice";
      const defaultName = filename || `Invoice_${String(invNo).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      if (window.electronAPI?.exportPdf) {
        const res = await window.electronAPI.exportPdf(defaultName);
        if (res.success) {
          showAlert({
            title: "PDF Exported",
            message: `Invoice PDF successfully exported to:\n${res.filePath}`,
            variant: "success",
          });
        } else if (!res.canceled) {
          showAlert({
            title: "Export Failed",
            message: res.error || "Unknown error occurred while generating PDF.",
            variant: "destructive",
          });
        }
      } else {
        showAlert({
          title: "Feature Unavailable",
          message: "Native PDF export is available in the desktop app.",
          variant: "info",
        });
      }
    } catch (err: any) {
      console.error("Export PDF error:", err);
      showAlert({
        title: "Export Error",
        message: err.message || String(err),
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Delete Invoice",
      message: "Are you sure you want to delete this invoice? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteInvoiceMutation.mutateAsync(id);
        } catch (err: any) {
          console.error("Failed to delete invoice:", err);
          showAlert({
            title: "Delete Failed",
            message: err.message || String(err),
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Invoice History
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse, view, print, and export all generated proforma and tax invoices.
          </p>
        </div>
        <Button onClick={onNavigateCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create New Invoice
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Recorded in SQLite database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹ {formatINR(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative billing value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Shipped</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQty.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative product units</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>Invoices Archive</CardTitle>
              <CardDescription>
                Showing {filteredInvoices.length} of {invoices.length} records
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice #, party, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground font-medium">No invoices found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm
                  ? "No matching records found. Try clearing your search."
                  : "Click 'Create New Invoice' to generate your first bill!"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Issuer Company</TableHead>
                  <TableHead>Buyer (Bill to)</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => {
                  const invoiceNo = inv.invoiceNo || (inv as any).invoice_no;
                  const invoiceDate = inv.invoiceDate || (inv as any).invoice_date;
                  const companyName = inv.companyName || (inv as any).company_name;
                  const partyName = inv.partyName || (inv as any).party_name;
                  const totalQuantity = inv.totalQuantity ?? (inv as any).total_quantity;
                  const totalQuantityUnit = inv.totalQuantityUnit || (inv as any).total_quantity_unit;
                  const totalAmount = inv.totalAmount ?? (inv as any).total_amount;

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-bold text-foreground font-mono">
                        {invoiceNo}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateDisplay(invoiceDate)}
                      </TableCell>
                      <TableCell
                        className="text-xs font-medium max-w-[180px] truncate"
                        title={companyName}
                      >
                        {companyName}
                      </TableCell>
                      <TableCell
                        className="text-xs font-semibold max-w-[180px] truncate"
                        title={partyName}
                      >
                        {partyName}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {Number(totalQuantity).toFixed(2)} {totalQuantityUnit}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        ₹ {formatINR(totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenView(inv)}
                            title="View / Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsViewModalOpen(true);
                              setTimeout(() => handlePrint(), 200);
                            }}
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleExportPdf(
                                `Invoice_${String(invoiceNo).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
                              )
                            }
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(inv.id)}
                            disabled={deleteInvoiceMutation.isPending}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        onPrint={handlePrint}
        onExportPdf={(filename) => handleExportPdf(filename)}
      />
    </div>
  );
};
