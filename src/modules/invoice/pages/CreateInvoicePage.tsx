import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import { invoiceFormSchema, InvoiceFormSchemaType } from "../zod";
import { useCreateInvoice } from "../hooks";
import { useGetAllCompanies, useCreateCompany } from "@/modules/company/hooks";
import { useGetAllParties, useCreateParty } from "@/modules/party/hooks";
import { useGetAllProducts, useCreateProduct } from "@/modules/product/hooks";

import { InvoiceDocument } from "../components/InvoiceDocument";
import { CompanyFormDialog } from "@/modules/company/components/CompanyFormDialog";
import { PartyFormDialog } from "@/modules/party/components/PartyFormDialog";
import { ProductFormDialog } from "@/modules/product/components/ProductFormDialog";
import { useAlert } from "@/context/AlertDialogContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  Eye,
  FileEdit,
  Building2,
  Package,
} from "lucide-react";
import {
  InvoiceTitle,
  INVOICE_TITLE_OPTIONS,
  GstType,
  GST_TYPE_OPTIONS,
  GstRate,
  GST_RATE_OPTIONS,
  QuantityUnit,
  QUANTITY_UNIT_OPTIONS,
  TaxPreset,
  TAX_PRESET_OPTIONS,
} from "@/constants/enums";

export const CreateInvoicePage: React.FC = () => {
  // TanStack Query Hooks
  const { data: companies = [] } = useGetAllCompanies();
  const { data: parties = [] } = useGetAllParties();
  const { data: products = [] } = useGetAllProducts();

  const createCompanyMutation = useCreateCompany();
  const createPartyMutation = useCreateParty();
  const createProductMutation = useCreateProduct();
  const createInvoiceMutation = useCreateInvoice();
  const { showAlert } = useAlert();

  // Inline Dialog states
  const [isCompDialogOpen, setIsCompDialogOpen] = useState(false);
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isProdDialogOpen, setIsProdDialogOpen] = useState(false);

  // Tab View for desktop preview: 'form' | 'preview' | 'split'
  const [activeTab, setActiveTab] = useState<"form" | "preview" | "split">("split");

  // React Hook Form with Zod Schema
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormSchemaType>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNo: "BI/2024/25/001",
      invoiceTitle: InvoiceTitle.PROFORMA,
      invoiceDate: dayjs().format("YYYY-MM-DD"),
      companyId: 0,
      partyId: 0,
      companyName: "",
      companyAddress: "",
      companyGstin: "",
      companyStateName: "",
      partyName: "",
      partyAddress: "",
      partyGstin: "",
      partyStateName: "",
      items: [
        {
          id: `item-${Date.now()}-1`,
          slNo: 1,
          productId: null,
          description: "",
          quantity: 1,
          rate: 0,
          per: "SETS",
          amount: 0,
        },
      ],
      taxPreset: TaxPreset.IGST_18,
      gstEntries: [
        {
          id: `gst-${Date.now()}-1`,
          type: GstType.IGST,
          rate: GstRate.RATE_18,
          amount: 0,
        },
      ],
      roundOff: 0.4,
      totalQuantityUnit: QuantityUnit.SET,
      declaration:
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const {
    fields: gstFields,
    append: appendGst,
    remove: removeGst,
  } = useFieldArray({
    control,
    name: "gstEntries",
  });

  // Watch form fields for live preview and reactive computations
  const formValues = watch();
  const watchedItems = formValues.items || [];
  const watchedGstEntries = formValues.gstEntries || [];
  const watchedTaxPreset = formValues.taxPreset;
  const watchedRoundOff = Number(formValues.roundOff) || 0;
  const watchedCompanyId = formValues.companyId;
  const watchedPartyId = formValues.partyId;

  // Auto-select initial company/party when loaded if not yet set
  useEffect(() => {
    if (!watchedCompanyId && companies.length > 0) {
      const first = companies[0];
      setValue("companyId", first.id);
      setValue("companyName", first.name);
      setValue("companyAddress", first.address);
      setValue("companyGstin", first.gstin);
      setValue("companyStateName", first.stateName);
    }
  }, [companies, watchedCompanyId, setValue]);

  useEffect(() => {
    if (!watchedPartyId && parties.length > 0) {
      const first = parties[0];
      setValue("partyId", first.id);
      setValue("partyName", first.name);
      setValue("partyAddress", first.address);
      setValue("partyGstin", first.gstin);
      setValue("partyStateName", first.stateName);
    }
  }, [parties, watchedPartyId, setValue]);

  // Derived calculations
  const subtotal = watchedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

  // Sync tax preset rates & amounts with subtotal
  useEffect(() => {
    if (watchedTaxPreset === TaxPreset.IGST_18) {
      const amt = Number(((subtotal * 18) / 100).toFixed(2));
      setValue("gstEntries", [
        {
          id: "gst-igst-18",
          type: GstType.IGST,
          rate: GstRate.RATE_18,
          amount: amt,
        },
      ]);
    } else if (watchedTaxPreset === TaxPreset.CGST_SGST_9) {
      const halfAmt = Number(((subtotal * 9) / 100).toFixed(2));
      setValue("gstEntries", [
        {
          id: "gst-cgst-9",
          type: GstType.CGST,
          rate: GstRate.RATE_9,
          amount: halfAmt,
        },
        {
          id: "gst-sgst-9",
          type: GstType.SGST,
          rate: GstRate.RATE_9,
          amount: halfAmt,
        },
      ]);
    }
  }, [subtotal, watchedTaxPreset, setValue]);

  const totalGst = watchedGstEntries.reduce(
    (acc, g) => acc + (Number(g.amount) || 0),
    0
  );
  const totalQuantity = watchedItems.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0),
    0
  );
  const totalAmount = Number((subtotal + totalGst + watchedRoundOff).toFixed(2));

  // Auto round-off calculation
  const applyAutoRoundOff = () => {
    const exact = subtotal + totalGst;
    const rounded = Math.round(exact);
    const diff = Number((rounded - exact).toFixed(2));
    setValue("roundOff", diff);
  };

  // Company selection change
  const handleCompanyChange = (idStr: string) => {
    const id = Number(idStr);
    const comp = companies.find((c) => c.id === id);
    if (comp) {
      setValue("companyId", comp.id);
      setValue("companyName", comp.name);
      setValue("companyAddress", comp.address);
      setValue("companyGstin", comp.gstin);
      setValue("companyStateName", comp.stateName);
    }
  };

  // Party selection change
  const handlePartyChange = (idStr: string) => {
    const id = Number(idStr);
    const party = parties.find((p) => p.id === id);
    if (party) {
      setValue("partyId", party.id);
      setValue("partyName", party.name);
      setValue("partyAddress", party.address);
      setValue("partyGstin", party.gstin);
      setValue("partyStateName", party.stateName);
    }
  };

  // Product selection in item row
  const handleSelectProduct = (index: number, productIdStr: string) => {
    const prodId = Number(productIdStr);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setValue(`items.${index}.productId`, prodId);
      setValue(`items.${index}.description`, prod.name);
    }
  };

  // Row recalculation for quantity * rate
  const handleItemNumberChange = (
    index: number,
    field: "quantity" | "rate",
    value: number
  ) => {
    setValue(`items.${index}.${field}`, value);
    const currentQty = field === "quantity" ? value : Number(watchedItems[index]?.quantity || 0);
    const currentRate = field === "rate" ? value : Number(watchedItems[index]?.rate || 0);
    const amount = Number((currentQty * currentRate).toFixed(2));
    setValue(`items.${index}.amount`, amount);
  };

  // Printing & Exporting
  const printCurrentInvoice = async () => {
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

  const exportPdf = async (defaultFilename?: string) => {
    try {
      const filename =
        defaultFilename ||
        `Invoice_${formValues.invoiceNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      if (window.electronAPI?.exportPdf) {
        const res = await window.electronAPI.exportPdf(filename);
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

  // Submit Handler
  const onSubmit = async (data: InvoiceFormSchemaType) => {
    try {
      await createInvoiceMutation.mutateAsync({
        invoiceNo: data.invoiceNo.trim(),
        invoiceTitle: data.invoiceTitle,
        invoiceDate: data.invoiceDate,
        companyId: data.companyId,
        partyId: data.partyId,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyGstin: data.companyGstin,
        companyStateName: data.companyStateName,
        partyName: data.partyName,
        partyAddress: data.partyAddress,
        partyGstin: data.partyGstin,
        partyStateName: data.partyStateName,
        items: data.items,
        subtotal: subtotal,
        gstEntries: data.gstEntries,
        roundOff: Number(data.roundOff) || 0,
        totalAmount: totalAmount,
        totalQuantity: totalQuantity,
        totalQuantityUnit: data.totalQuantityUnit,
        declaration: data.declaration || "",
      });
      showAlert({
        title: "Invoice Created",
        message: `Invoice #${data.invoiceNo} created and saved successfully!`,
        variant: "success",
      });
    } catch (err: any) {
      console.error("Failed to save invoice:", err);
      showAlert({
        title: "Failed to Save Invoice",
        message: err.message || "Unknown error occurred while saving invoice.",
        variant: "destructive",
      });
    }
  };

  const selectedCompany = companies.find((c) => c.id === watchedCompanyId);
  const selectedParty = parties.find((p) => p.id === watchedPartyId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-0.5">
            Create proforma and tax invoices with instant live preview, print, and PDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab selector */}
          <div className="flex rounded-md border bg-muted/40 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                activeTab === "form"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" /> Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`hidden xl:flex px-3 py-1.5 rounded-sm transition-colors items-center gap-1.5 ${
                activeTab === "split"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={printCurrentInvoice}
            className="flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => exportPdf()}
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || createInvoiceMutation.isPending}
            className="flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {createInvoiceMutation.isPending ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Form / Preview */}
      <div className={`grid gap-6 ${activeTab === "split" ? "xl:grid-cols-12" : "grid-cols-1"}`}>
        {/* Editor Form Column */}
        {(activeTab === "form" || activeTab === "split") && (
          <div className={`space-y-6 ${activeTab === "split" ? "xl:col-span-6" : "col-span-1"}`}>
            {/* 1. Header & Organization Meta */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Header & Issuing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Invoice Document Title</Label>
                    <Select
                      value={formValues.invoiceTitle}
                      onValueChange={(val) => setValue("invoiceTitle", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_TITLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-no">Invoice No. *</Label>
                    <Input
                      id="inv-no"
                      {...register("invoiceNo")}
                      placeholder="e.g. BI/2024/25/001"
                    />
                    {errors.invoiceNo && (
                      <p className="text-xs text-destructive">{errors.invoiceNo.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-date">Dated *</Label>
                    <Input
                      id="inv-date"
                      type="date"
                      {...register("invoiceDate")}
                    />
                    {errors.invoiceDate && (
                      <p className="text-xs text-destructive">{errors.invoiceDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Select Company */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Company (Seller) *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-xs text-primary"
                        onClick={() => setIsCompDialogOpen(true)}
                      >
                        + New Company
                      </Button>
                    </div>
                    <Select
                      value={watchedCompanyId ? String(watchedCompanyId) : ""}
                      onValueChange={handleCompanyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name} ({c.gstin.slice(0, 2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.companyId && (
                      <p className="text-xs text-destructive">{errors.companyId.message}</p>
                    )}
                    {selectedCompany && (
                      <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground space-y-0.5 border">
                        <div className="font-semibold text-foreground">{selectedCompany.name}</div>
                        <div>{selectedCompany.address}</div>
                        <div>
                          GSTIN: {selectedCompany.gstin} | {selectedCompany.stateName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Select Party */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Buyer (Bill to Party) *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-xs text-primary"
                        onClick={() => setIsPartyDialogOpen(true)}
                      >
                        + New Party
                      </Button>
                    </div>
                    <Select
                      value={watchedPartyId ? String(watchedPartyId) : ""}
                      onValueChange={handlePartyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer party..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} ({p.gstin.slice(0, 2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.partyId && (
                      <p className="text-xs text-destructive">{errors.partyId.message}</p>
                    )}
                    {selectedParty && (
                      <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground space-y-0.5 border">
                        <div className="font-semibold text-foreground">{selectedParty.name}</div>
                        <div>{selectedParty.address}</div>
                        <div>
                          GSTIN: {selectedParty.gstin} | {selectedParty.stateName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Product Line Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Description of Goods (Line Items)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProdDialogOpen(true)}
                      className="text-xs"
                    >
                      + Add New Product to DB
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        appendItem({
                          id: `item-${Date.now()}-${itemFields.length + 1}`,
                          slNo: itemFields.length + 1,
                          productId: null,
                          description: "",
                          quantity: 1,
                          rate: 0,
                          per: "SETS",
                          amount: 0,
                        })
                      }
                      className="text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Row
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-[45px] text-center">#</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                        <TableHead className="w-[90px]">Qty</TableHead>
                        <TableHead className="w-[100px]">Rate (₹)</TableHead>
                        <TableHead className="w-[90px]">per</TableHead>
                        <TableHead className="w-[100px] text-right">Amount (₹)</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemFields.map((field, index) => (
                        <TableRow key={field.id} className="text-xs">
                          <TableCell className="text-center font-mono text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="space-y-1">
                            {/* Fast product selector dropdown */}
                            <Select
                              value={
                                watchedItems[index]?.productId
                                  ? String(watchedItems[index].productId)
                                  : ""
                              }
                              onValueChange={(val) => handleSelectProduct(index, val)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Pick a product..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name} {p.tags ? `(${p.tags})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Free text description input */}
                            <Input
                              {...register(`items.${index}.description`)}
                              placeholder="Description of goods..."
                              className="h-8 text-xs font-medium"
                            />
                            {errors.items?.[index]?.description && (
                              <p className="text-[10px] text-destructive">
                                {errors.items[index]?.description?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={watchedItems[index]?.quantity ?? 0}
                              onChange={(e) =>
                                handleItemNumberChange(
                                  index,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8 text-xs text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={watchedItems[index]?.rate ?? 0}
                              onChange={(e) =>
                                handleItemNumberChange(
                                  index,
                                  "rate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8 text-xs text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`items.${index}.per`)}
                              placeholder="SETS"
                              className="h-8 text-xs text-center uppercase"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {(Number(watchedItems[index]?.amount) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={itemFields.length === 1}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-3 bg-muted/20 border-t flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Items Subtotal:</span>
                  <span className="font-bold font-mono text-base">₹ {subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Tax & GST Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Taxes & GST Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* GST Preset Options */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-semibold">
                    GST Preset Options
                  </Label>
                  <RadioGroup
                    value={watchedTaxPreset}
                    onValueChange={(val: any) => setValue("taxPreset", val)}
                    className="flex flex-col sm:flex-row gap-4 pt-1"
                  >
                    {TAX_PRESET_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`preset-${opt.value}`} />
                        <Label
                          htmlFor={`preset-${opt.value}`}
                          className="cursor-pointer font-medium"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* GST Entries */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold">
                      GST Entries ({gstFields.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("taxPreset", TaxPreset.CUSTOM);
                        appendGst({
                          id: `gst-${Date.now()}-${gstFields.length + 1}`,
                          type: GstType.GST,
                          rate: GstRate.RATE_18,
                          amount: Number(((subtotal * 18) / 100).toFixed(2)),
                        });
                      }}
                      className="text-xs flex items-center gap-1 h-7"
                    >
                      <Plus className="h-3 w-3" /> Add GST Row
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {gstFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-2 rounded border bg-card text-xs"
                      >
                        {/* GST dropdown */}
                        <div className="w-[120px]">
                          <Select
                            value={watchedGstEntries[index]?.type || GstType.IGST}
                            onValueChange={(val: GstType) => {
                              setValue("taxPreset", TaxPreset.CUSTOM);
                              setValue(`gstEntries.${index}.type`, val);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GST_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rate dropdown */}
                        <div className="w-[110px]">
                          <Select
                            value={String(watchedGstEntries[index]?.rate ?? 18)}
                            onValueChange={(val) => {
                              setValue("taxPreset", TaxPreset.CUSTOM);
                              const rateNum = Number(val) as GstRate;
                              setValue(`gstEntries.${index}.rate`, rateNum);
                              const newAmt = Number(((subtotal * rateNum) / 100).toFixed(2));
                              setValue(`gstEntries.${index}.amount`, newAmt);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GST_RATE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={String(opt.value)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Calculated amount */}
                        <div className="flex-1 text-right font-mono font-semibold pr-2">
                          ₹ {(Number(watchedGstEntries[index]?.amount) || 0).toFixed(2)}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setValue("taxPreset", TaxPreset.CUSTOM);
                            removeGst(index);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round Off and Total Quantity Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="round-off">Round Off (₹)</Label>
                      <button
                        type="button"
                        onClick={applyAutoRoundOff}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Auto-Round
                      </button>
                    </div>
                    <Input
                      id="round-off"
                      type="number"
                      step="0.01"
                      {...register("roundOff", { valueAsNumber: true })}
                      className="font-mono text-right"
                    />
                  </div>

                  {/* Quantity Unit */}
                  <div className="space-y-1.5">
                    <Label>Total Quantity Unit *</Label>
                    <Select
                      value={formValues.totalQuantityUnit}
                      onValueChange={(val: QuantityUnit) => setValue("totalQuantityUnit", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUANTITY_UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="rounded-lg bg-muted/40 p-4 border space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total GST:</span>
                    <span className="font-mono">+ ₹ {totalGst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Round Off:</span>
                    <span className="font-mono">
                      {watchedRoundOff >= 0
                        ? `+ ₹ ${watchedRoundOff.toFixed(2)}`
                        : `- ₹ ${Math.abs(watchedRoundOff).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Quantity:</span>
                    <span className="font-mono font-medium">
                      {totalQuantity.toFixed(2)} {formValues.totalQuantityUnit}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary text-xl">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Declaration */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="declaration-text">Declaration Note</Label>
                  <Input id="declaration-text" {...register("declaration")} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Live Preview Column */}
        {(activeTab === "preview" || activeTab === "split") && (
          <div className={`${activeTab === "split" ? "xl:col-span-6" : "col-span-1"}`}>
            <div className="sticky top-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-primary" />
                    Exact Print / PDF Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={printCurrentInvoice}
                      className="h-8 text-xs"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" /> Print
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => exportPdf()}
                      className="h-8 text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                  </div>
                </div>

                {/* Render the exact invoice document */}
                <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-inner">
                  <InvoiceDocument
                    invoiceTitle={formValues.invoiceTitle}
                    invoiceNo={formValues.invoiceNo}
                    invoiceDate={formValues.invoiceDate}
                    companyName={selectedCompany?.name || ""}
                    companyAddress={selectedCompany?.address || ""}
                    companyGstin={selectedCompany?.gstin || ""}
                    companyState={selectedCompany?.stateName || ""}
                    partyName={selectedParty?.name || ""}
                    partyAddress={selectedParty?.address || ""}
                    partyGstin={selectedParty?.gstin || ""}
                    partyState={selectedParty?.stateName || ""}
                    items={watchedItems}
                    subtotal={subtotal}
                    gstEntries={watchedGstEntries}
                    roundOff={watchedRoundOff}
                    totalAmount={totalAmount}
                    totalQuantity={totalQuantity}
                    totalQuantityUnit={formValues.totalQuantityUnit}
                    declaration={formValues.declaration}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Quick Creation Dialogs */}
      <CompanyFormDialog
        isOpen={isCompDialogOpen}
        onClose={() => setIsCompDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await createCompanyMutation.mutateAsync(data);
          if (created && typeof created === "object" && "id" in created) {
            setValue("companyId", created.id as number);
            setValue("companyName", created.name);
            setValue("companyAddress", created.address);
            setValue("companyGstin", created.gstin);
            setValue("companyStateName", created.stateName);
          }
        }}
      />

      <PartyFormDialog
        isOpen={isPartyDialogOpen}
        onClose={() => setIsPartyDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await createPartyMutation.mutateAsync(data);
          if (created && typeof created === "object" && "id" in created) {
            setValue("partyId", created.id as number);
            setValue("partyName", created.name);
            setValue("partyAddress", created.address);
            setValue("partyGstin", created.gstin);
            setValue("partyStateName", created.stateName);
          }
        }}
      />

      <ProductFormDialog
        isOpen={isProdDialogOpen}
        onClose={() => setIsProdDialogOpen(false)}
        onSubmit={async (data) => {
          await createProductMutation.mutateAsync(data);
        }}
      />
    </form>
  );
};
