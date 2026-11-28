import { useCreateCompany, useGetAllCompanies } from "@/modules/company/hooks";
import { useCreateParty, useGetAllParties } from "@/modules/party/hooks";
import { useCreateProduct, useGetAllProducts } from "@/modules/product/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useCreateInvoice } from "../hooks";
import {
  invoiceFormSchema,
  InvoiceFormSchemaType,
  InvoiceItemFormSchemaType,
} from "../zod";

import { PageHeader } from "@/components/layout/PageHeader";
import { useAlert } from "@/context/AlertDialogContext";
import { CompanyFormDialog } from "@/modules/company/components/CompanyFormDialog";
import { PartyFormDialog } from "@/modules/party/components/PartyFormDialog";
import { ProductFormDialog } from "@/modules/product/components/ProductFormDialog";
import { InvoiceViewModal } from "../components/InvoiceViewModal";

import DatePicker from "@/components/date-picker";
import NumberField from "@/components/NumberField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertVariant,
  GST_RATE_OPTIONS,
  GST_TYPE_OPTIONS,
  GstRate,
  GstType,
  INVOICE_TITLE_OPTIONS,
  InvoiceModalMode,
  InvoiceTitle,
  QUANTITY_UNIT_OPTIONS,
  QuantityUnit,
  TAX_PRESET_OPTIONS,
  TaxPreset,
} from "@/constants/enums";
import {
  Building2,
  Eye,
  Package,
  Percent,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { TInvoiceSchema } from "../schema";

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

  // Inline Quick Dialog states
  const [isCompDialogOpen, setIsCompDialogOpen] = useState(false);
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isProdDialogOpen, setIsProdDialogOpen] = useState(false);

  // Invoice Preview Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<InvoiceModalMode>(
    InvoiceModalMode.PREVIEW,
  );
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [pendingSaveData, setPendingSaveData] =
    useState<InvoiceFormSchemaType | null>(null);

  // React Hook Form with Zod Schema
  const {
    control,
    handleSubmit,

    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<InvoiceFormSchemaType>({
    resolver: zodResolver(invoiceFormSchema),

    defaultValues: {
      invoiceNo: "",
      invoiceTitle: InvoiceTitle.PROFORMA,
      invoiceDate: dayjs().format("YYYY-MM-DD"),
      items: [
        {
          amount: 0,
          id: nanoid(5),
          per: QuantityUnit.SET,

          quantity: 1,
          rate: 0,
        },
      ],
      taxPreset: TaxPreset.IGST_18,
      gstEntries: [
        {
          id: nanoid(5),
          type: GstType.IGST,
          rate: GstRate.RATE_18,
          amount: 0,
        },
      ],
      roundOff: 0,
      transport: "",
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

  const companyOptions: ComboboxOption[] = useMemo(
    () =>
      companies.map((c) => {
        const gstin = c.gstin?.trim();
        return {
          value: c.id,
          label: gstin ? `${c.name} (${gstin.slice(0, 2)})` : c.name,
          description: gstin ? `GSTIN: ${gstin} | ${c.stateName}` : c.stateName,
          keywords: [c.name, gstin || "", c.stateName, c.address].filter(
            Boolean,
          ),
        };
      }),
    [companies],
  );

  const partyOptions: ComboboxOption[] = useMemo(
    () =>
      parties.map((p) => {
        const gstin = p.gstin?.trim();
        return {
          value: p.id,
          label: gstin ? `${p.name} (${gstin.slice(0, 2)})` : p.name,
          description: gstin ? `GSTIN: ${gstin} | ${p.stateName}` : p.stateName,
          keywords: [p.name, gstin || "", p.stateName, p.address].filter(
            Boolean,
          ),
        };
      }),
    [parties],
  );

  const productOptions: ComboboxOption[] = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.name,
        keywords: [p.name],
      })),
    [products],
  );

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });
  const watchedGstEntries = useWatch({
    control,
    name: "gstEntries",
    defaultValue: [],
  });

  const watchedRoundOff = useWatch({
    control,
    name: "roundOff",
    defaultValue: 0,
  });
  const watchedSelectedCompany = useWatch({
    control,
    name: "company",
  });
  const watchedSelectedParty = useWatch({
    control,
    name: "party",
  });

  useEffect(() => {
    if (companies.length > 0) {
      const first = companies[0];

      setValue("company", {
        address: first?.address,
        gstin: first?.gstin,
        id: first?.id,
        name: first.name,
        stateName: first?.stateName,
      });
    }
  }, [companies, setValue]);

  // Derived calculations
  const subtotal = useMemo(
    () => watchedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0),
    [watchedItems],
  );

  // Sync tax preset rates & amounts with subtotal
  useEffect(() => {
    const newGstEntries = watchedGstEntries?.map((item) => {
      return {
        ...item,
        amount: Number(((subtotal * item?.rate) / 100).toFixed(2)),
      };
    });

    setValue("gstEntries", newGstEntries);
  }, [subtotal, watchedGstEntries, setValue]);

  const onGstPresetChange = (value: TaxPreset) => {
    setValue("taxPreset", value);
    if (value === TaxPreset.IGST_18) {
      setValue("gstEntries", [
        {
          id: nanoid(5),
          type: GstType.IGST,
          rate: GstRate.RATE_18,
          amount: 0,
        },
      ]);
    } else if (value === TaxPreset.CGST_SGST_9) {
      setValue("gstEntries", [
        {
          id: nanoid(5),
          type: GstType.CGST,
          rate: GstRate.RATE_9,
          amount: 0,
        },
        {
          id: nanoid(5),
          type: GstType.SGST,
          rate: GstRate.RATE_9,
          amount: 0,
        },
      ]);
    }
  };

  const totalGst = useMemo(
    () =>
      watchedGstEntries.reduce((acc, g) => acc + (Number(g.amount) || 0), 0),
    [watchedGstEntries],
  );

  const totalAmount = useMemo(
    () => subtotal + totalGst + watchedRoundOff,
    [subtotal, totalGst, watchedRoundOff],
  );

  // Auto round-off calculation
  const applyAutoRoundOff = () => {
    const exact = subtotal + totalGst;
    const rounded = Math.round(exact);
    const diff = Number((rounded - exact).toFixed(2));
    setValue("roundOff", diff);
  };

  // Company selection change
  const handleCompanyChange = (id: number) => {
    const comp = companies.find((c) => c.id === id);
    if (comp) {
      setValue(
        "company",
        {
          address: comp?.address,
          gstin: comp?.gstin,
          id: comp?.id,
          name: comp?.name,
          stateName: comp?.stateName,
        },
        {
          shouldValidate: true,
        },
      );
    }
  };

  // Party selection change
  const handlePartyChange = (id: Number) => {
    const party = parties.find((p) => p.id === id);
    if (party) {
      setValue(
        "party",
        {
          address: party?.address,
          gstin: party?.gstin,
          id: party?.id,
          name: party?.name,
          stateName: party?.stateName,
        },
        {
          shouldValidate: true,
        },
      );
    }
  };

  // Product selection in item row
  const handleSelectProduct = (index: number, prodId: Number) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setValue(
        `items.${index}.product`,
        {
          id: prod?.id,
          name: prod?.name,
        },
        {
          shouldValidate: true,
        },
      );
    }
  };

  // Row recalculation for quantity * rate
  const handleItemNumberChange = (
    index: number,
    field: "quantity" | "rate",
    value: number,
  ) => {
    setValue(`items.${index}.${field}`, value, { shouldValidate: true });
    const currentQty =
      field === "quantity" ? value : getValues(`items.${index}.quantity`) || 0;
    const currentRate =
      field === "rate" ? value : getValues(`items.${index}.rate`) || 0;

    const amount = Number((currentQty * currentRate).toFixed(2));
    setValue(`items.${index}.amount`, amount);
  };

  // Printing & Exporting
  const printCurrentInvoice = async () => {
    try {
      if (window.electronAPI?.printInvoice) {
        const res = await window.electronAPI.printInvoice();
        if (!res.success && !res.canceled) {
          showAlert({
            title: res.noPrinters ? "No Printer Found" : "Print Failed",
            message: res.error || "No printer found on this system",
            variant: res.noPrinters
              ? AlertVariant.WARNING
              : AlertVariant.DESTRUCTIVE,
          });
        }
      } else {
        window.print();
      }
    } catch (err: any) {
      console.error("Print failed:", err);
      showAlert({
        title: "Print Error",
        message: err?.message || String(err),
        variant: AlertVariant.DESTRUCTIVE,
      });
    }
  };

  const exportPdf = async (defaultFilename?: string) => {
    try {
      const filename =
        defaultFilename ||
        `Invoice_${getValues("invoiceNo").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      if (window.electronAPI?.exportPdf) {
        const res = await window.electronAPI.exportPdf(filename);
        if (res.success) {
          showAlert({
            title: "PDF Exported",
            message: `Invoice PDF successfully exported to:\n${res.filePath}`,
            variant: AlertVariant.SUCCESS,
          });
        } else if (!res.canceled) {
          showAlert({
            title: "Export Failed",
            message:
              res.error || "Unknown error occurred while generating PDF.",
            variant: AlertVariant.DESTRUCTIVE,
          });
        }
      } else {
        showAlert({
          title: "Feature Unavailable",
          message: "Native PDF export is available in the desktop app.",
          variant: AlertVariant.INFO,
        });
      }
    } catch (err: any) {
      console.error("Export PDF error:", err);
      showAlert({
        title: "Export Error",
        message: err.message || String(err),
        variant: AlertVariant.DESTRUCTIVE,
      });
    }
  };

  // Build current invoice object from form state
  const buildCurrentInvoiceData = (
    value: InvoiceFormSchemaType,
  ): TInvoiceSchema["Preview"] => {
    return {
      invoiceNo: value?.invoiceNo ?? "",
      invoiceTitle: value?.invoiceTitle ?? "",
      invoiceDate: value.invoiceDate ?? "",
      company: value?.company,

      party: value.party,
      items: value?.items ?? [],
      subtotal: subtotal,
      gstEntries: value.gstEntries,
      roundOff: value.roundOff || 0,
      totalAmount: totalAmount || 0,
      transport: value.transport?.trim() || "",
      declaration: value.declaration || "",
    };
  };

  // 1. Preview button handler - opens in view-only mode
  const handleOpenPreview = () => {
    setPreviewInvoice(buildCurrentInvoiceData(getValues()));
    setModalMode(InvoiceModalMode.PREVIEW);
    setIsViewModalOpen(true);
  };

  // 2. Save button handler - validates first, then opens modal with save action
  const onFormValidForSave = (data: InvoiceFormSchemaType) => {
    setPendingSaveData(data);
    setPreviewInvoice(buildCurrentInvoiceData(data));
    setModalMode(InvoiceModalMode.PREVIEW_WITH_SAVE);
    setIsViewModalOpen(true);
  };

  // 3. Modal save execution
  const handleModalSave = async () => {
    if (!pendingSaveData) return;
    try {
      await createInvoiceMutation.mutateAsync({
        invoiceNo: pendingSaveData.invoiceNo.trim(),
        invoiceTitle: pendingSaveData.invoiceTitle,
        invoiceDate: pendingSaveData.invoiceDate,
        companyId: pendingSaveData.company?.id,
        partyId: pendingSaveData.party?.id,
        companyName: pendingSaveData.company?.name,
        companyAddress: pendingSaveData.company?.address,
        companyGstin: pendingSaveData.company?.gstin || "",
        companyStateName: pendingSaveData.company?.stateName,
        partyName: pendingSaveData.party?.name,
        partyAddress: pendingSaveData.party?.address,
        partyGstin: pendingSaveData.party?.gstin || "",
        partyStateName: pendingSaveData.party?.stateName,
        items: (pendingSaveData?.items || [])?.map((item) => ({
          amount: item?.amount,
          id: item?.id,
          per: item?.per,
          productName: item?.product?.name,
          quantity: item?.quantity,
          rate: item?.rate,
          productId: item?.product?.id,
        })),
        subtotal: subtotal,
        gstEntries: pendingSaveData.gstEntries,
        roundOff: Number(pendingSaveData.roundOff) || 0,
        totalAmount: totalAmount,
        transport: pendingSaveData.transport?.trim() || "",
        declaration: pendingSaveData.declaration || "",
      });

      // Replace save button with print and download
      setModalMode(InvoiceModalMode.PREVIEW_WITH_PRINT);
    } catch (err: any) {
      console.error("Failed to save invoice:", err);
      showAlert({
        title: "Failed to Save Invoice",
        message: err.message || "Unknown error occurred while saving invoice.",
        variant: AlertVariant.DESTRUCTIVE,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormValidForSave)} className="space-y-6">
      <PageHeader
        title="Create Invoice"
        bordered
        actions={
          <>
            {/* Preview button: opens preview modal with no print or download */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenPreview}
              className="flex items-center gap-1.5"
            >
              <Eye className="h-4 w-4" /> Preview
            </Button>

            {/* Save button: validates form and opens modal with Save button */}
            <Button
              type="submit"
              disabled={isSubmitting || createInvoiceMutation.isPending}
              className="flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Invoice
            </Button>
          </>
        }
      />

      {/* Main Form Fields */}
      <div className="space-y-6">
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
              <Controller
                control={control}
                name="invoiceTitle"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel required>Invoice Document Title</FieldLabel>
                    <FieldContent>
                      <Select
                        value={field?.value}
                        onValueChange={field?.onChange}
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

                      {fieldState?.invalid && (
                        <FieldError errors={[fieldState?.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="invoiceNo"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel required>Invoice No.</FieldLabel>
                    <FieldContent>
                      <Input onFocus={(e) => e.target.select()} {...field} />
                      {fieldState?.invalid && (
                        <FieldError errors={[fieldState?.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="invoiceDate"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel required>Dated</FieldLabel>
                    <FieldContent>
                      <DatePicker
                        value={field?.value}
                        onChange={field?.onChange}
                        placeholder="Select Date"
                      />
                      {fieldState?.invalid && (
                        <FieldError errors={[fieldState?.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Select Company */}
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="company"
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="flex justify-between items-center">
                        <FieldLabel required>Company (Seller)</FieldLabel>

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

                      <FieldContent>
                        <Combobox
                          ref={field.ref}
                          value={field.value?.id}
                          onChange={(val) => {
                            field.onChange(val);
                            handleCompanyChange(Number(val));
                          }}
                          options={companyOptions}
                          placeholder="Select company..."
                          searchPlaceholder="Search company by name, GSTIN, state..."
                          emptyText="No company found."
                        />

                        {fieldState?.invalid && (
                          <FieldError errors={[fieldState?.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                {watchedSelectedCompany && (
                  <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground space-y-0.5 border">
                    <div className="font-semibold text-foreground">
                      {watchedSelectedCompany?.name}
                    </div>
                    <div>{watchedSelectedCompany?.address}</div>
                    <div>
                      {watchedSelectedCompany?.gstin
                        ? `GSTIN: ${watchedSelectedCompany.gstin} | `
                        : ""}
                      {watchedSelectedCompany?.stateName}
                    </div>
                  </div>
                )}
              </div>

              {/* Select Party */}
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="party"
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="flex justify-between items-center">
                        <FieldLabel required>Buyer (Bill to Party)</FieldLabel>

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

                      <FieldContent>
                        <Combobox
                          ref={field.ref}
                          value={field.value?.id}
                          onChange={(val) => {
                            field.onChange(val);
                            handlePartyChange(Number(val));
                          }}
                          options={partyOptions}
                          placeholder="Select buyer party..."
                          searchPlaceholder="Search party by name, GSTIN, state..."
                          emptyText="No party found."
                        />

                        {fieldState?.invalid && (
                          <FieldError errors={[fieldState?.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                {watchedSelectedParty && (
                  <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground space-y-0.5 border">
                    <div className="font-semibold text-foreground">
                      {watchedSelectedParty?.name}
                    </div>
                    <div>{watchedSelectedParty?.address}</div>
                    <div>
                      {watchedSelectedParty?.gstin
                        ? `GSTIN: ${watchedSelectedParty.gstin} | `
                        : ""}
                      {watchedSelectedParty?.stateName}
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
                Items
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProdDialogOpen(true)}
                  className="text-xs"
                >
                  + Add New Product
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendItem({
                      id: nanoid(5),

                      quantity: 1,
                      rate: 0,
                      per: QuantityUnit.SET,
                      amount: 0,
                    } as InvoiceItemFormSchemaType)
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
                    <TableHead className="min-w-[200px]">Product</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[100px]">Rate (₹)</TableHead>
                    <TableHead className="w-[100px]">per</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Amount (₹)
                    </TableHead>
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

                        <Controller
                          control={control}
                          name={`items.${index}.product`}
                          render={({ field, fieldState }) => (
                            <Field>
                              <FieldContent>
                                <Combobox
                                  ref={field.ref}
                                  value={field.value?.id}
                                  onChange={(val) => {
                                    field.onChange(val);
                                    handleSelectProduct(index, Number(val));
                                  }}
                                  options={productOptions}
                                  placeholder="Pick a product..."
                                  searchPlaceholder="Search product..."
                                  emptyText="No product found."
                                  contentClassName="min-w-[280px]"
                                />

                                {fieldState?.invalid && (
                                  <FieldError errors={[fieldState?.error]} />
                                )}
                              </FieldContent>
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field, fieldState }) => (
                            <Field>
                              <FieldContent>
                                <NumberField
                                  {...field}
                                  step={1}
                                  onFocus={(e) => e.target.select()}
                                  onValueChange={(value) => {
                                    handleItemNumberChange(
                                      index,
                                      "quantity",
                                      value,
                                    );
                                  }}
                                />
                                {fieldState?.invalid && (
                                  <FieldError errors={[fieldState?.error]} />
                                )}
                              </FieldContent>
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`items.${index}.rate`}
                          render={({ field, fieldState }) => (
                            <Field>
                              <FieldContent>
                                <NumberField
                                  {...field}
                                  step={1}
                                  onFocus={(e) => e.target.select()}
                                  onValueChange={(value) => {
                                    handleItemNumberChange(
                                      index,
                                      "rate",
                                      value,
                                    );
                                  }}
                                />
                                {fieldState?.invalid && (
                                  <FieldError errors={[fieldState?.error]} />
                                )}
                              </FieldContent>
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`items.${index}.per`}
                          render={({ field, fieldState }) => (
                            <Field>
                              <FieldContent>
                                <Select
                                  value={field?.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {QUANTITY_UNIT_OPTIONS.map((p) => (
                                      <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {fieldState?.invalid && (
                                  <FieldError errors={[fieldState?.error]} />
                                )}
                              </FieldContent>
                            </Field>
                          )}
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
              <div className="p-4">
                <Controller
                  control={control}
                  name="items"
                  render={({ fieldState }) => (
                    <Field>
                      <FieldContent>
                        {fieldState?.invalid && (
                          <FieldError errors={[fieldState?.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="p-3 bg-muted/20 border-t flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Items Subtotal:</span>
              <span className="font-bold font-mono text-base">
                ₹ {subtotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Tax & GST Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              Taxes & GST Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tax Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* GST Preset Options */}
                <Controller
                  control={control}
                  name="taxPreset"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel required>GST Preset Options</FieldLabel>
                      <FieldContent>
                        <RadioGroup
                          value={field?.value}
                          onValueChange={(value) => {
                            onGstPresetChange(value as TaxPreset);
                          }}
                          className="flex flex-wrap gap-x-5 gap-y-2 pt-1"
                        >
                          {TAX_PRESET_OPTIONS.map((opt) => (
                            <div
                              key={opt.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={opt.value}
                                id={`preset-${opt.value}`}
                              />
                              <Label
                                htmlFor={`preset-${opt.value}`}
                                className="cursor-pointer font-medium text-sm"
                              >
                                {opt.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {fieldState?.invalid && (
                          <FieldError errors={[fieldState?.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                {/* GST Entries */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-foreground">
                      GST Entries ({gstFields.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("taxPreset", TaxPreset.CUSTOM);
                        appendGst({
                          id: nanoid(5),
                          type: GstType.GST,
                          rate: GstRate.RATE_18,
                          amount: Number(((subtotal * 18) / 100).toFixed(2)),
                        });
                      }}
                      className="text-xs flex items-center gap-1 h-7 px-2.5"
                    >
                      <Plus className="h-3 w-3" /> Add GST Row
                    </Button>
                  </div>

                  <div className="rounded-md border border-border bg-white dark:bg-background divide-y divide-border/70 overflow-hidden">
                    {gstFields.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No GST entries applied. Click &quot;Add GST Row&quot; to
                        add one.
                      </div>
                    ) : (
                      gstFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs"
                        >
                          {/* GST dropdown */}
                          <div className="w-[115px]">
                            <Controller
                              control={control}
                              name={`gstEntries.${index}.type`}
                              render={({ field, fieldState }) => (
                                <Field>
                                  <FieldContent>
                                    <Select
                                      value={String(field?.value)}
                                      onValueChange={(val) => {
                                        setValue("taxPreset", TaxPreset.CUSTOM);
                                        field.onChange(val);
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {GST_TYPE_OPTIONS.map((opt) => (
                                          <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {fieldState?.invalid && (
                                      <FieldError
                                        errors={[fieldState?.error]}
                                      />
                                    )}
                                  </FieldContent>
                                </Field>
                              )}
                            />
                          </div>

                          {/* Rate dropdown */}
                          <div className="w-[100px]">
                            <Controller
                              control={control}
                              name={`gstEntries.${index}.rate`}
                              render={({ field, fieldState }) => (
                                <Field>
                                  <FieldContent>
                                    <Select
                                      value={String(field?.value)}
                                      onValueChange={(val) => {
                                        setValue("taxPreset", TaxPreset.CUSTOM);
                                        const rateNum = Number(val) as GstRate;

                                        field?.onChange(rateNum);
                                        const newAmt = Number(
                                          ((subtotal * rateNum) / 100).toFixed(
                                            2,
                                          ),
                                        );
                                        setValue(
                                          `gstEntries.${index}.amount`,
                                          newAmt,
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {GST_RATE_OPTIONS.map((opt) => (
                                          <SelectItem
                                            key={opt.value}
                                            value={String(opt.value)}
                                          >
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {fieldState?.invalid && (
                                      <FieldError
                                        errors={[fieldState?.error]}
                                      />
                                    )}
                                  </FieldContent>
                                </Field>
                              )}
                            />
                          </div>

                          {/* Calculated amount */}
                          <div className="flex-1 text-right font-mono font-semibold tabular-nums pr-1">
                            ₹{" "}
                            {(
                              Number(watchedGstEntries[index]?.amount) || 0
                            ).toFixed(2)}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue("taxPreset", TaxPreset.CUSTOM);
                              removeGst(index);
                            }}
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Round Off */}
                <div className="max-w-[220px]">
                  <Controller
                    control={control}
                    name="roundOff"
                    render={({ field, fieldState }) => (
                      <Field>
                        <div className="flex justify-between items-center">
                          <FieldLabel>Round Off (₹)</FieldLabel>

                          <button
                            type="button"
                            onClick={applyAutoRoundOff}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Auto-Round
                          </button>
                        </div>
                        <FieldContent>
                          <NumberField
                            allowNegative
                            {...field}
                            onValueChange={(value) => {
                              field?.onChange(value);
                            }}
                            onFocus={(e) => e.target.select()}
                          />
                          {fieldState?.invalid && (
                            <FieldError errors={[fieldState?.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Right Column: Summary Panel */}
              <div className="lg:col-span-5">
                <div className="rounded-md border border-border bg-muted/40 p-4 space-y-2.5 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1">
                    Calculation Summary
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-foreground">
                      ₹ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total GST</span>
                    <span className="font-mono tabular-nums text-foreground">
                      + ₹ {totalGst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Round Off</span>
                    <span className="font-mono tabular-nums text-foreground">
                      {watchedRoundOff >= 0
                        ? `+ ₹ ${watchedRoundOff.toFixed(2)}`
                        : `- ₹ ${Math.abs(watchedRoundOff).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-border/80 pt-3 mt-1 flex justify-between items-baseline font-bold text-base text-foreground">
                    <span>Grand Total</span>
                    <span className="font-mono tabular-nums text-primary text-xl">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Transport & Declaration */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <Controller
              control={control}
              name="transport"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Transport</FieldLabel>
                  <FieldContent>
                    <Input {...field} />
                    {fieldState?.invalid && (
                      <FieldError errors={[fieldState?.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="declaration"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel required>Declaration Note</FieldLabel>
                  <FieldContent>
                    <Input {...field} />
                    {fieldState?.invalid && (
                      <FieldError errors={[fieldState?.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Modal (Preview, Preview with Save, Preview with Print) */}
      <InvoiceViewModal
        invoice={previewInvoice}
        isOpen={isViewModalOpen}
        type={modalMode}
        onClose={() => {
          setIsViewModalOpen(false);
          if (modalMode === InvoiceModalMode.PREVIEW_WITH_PRINT) {
            setPendingSaveData(null);
          }
        }}
        onSave={handleModalSave}
        isSaving={createInvoiceMutation.isPending}
        onPrint={printCurrentInvoice}
        onExportPdf={exportPdf}
      />

      {/* Inline Quick Creation Dialogs */}
      <CompanyFormDialog
        isOpen={isCompDialogOpen}
        onClose={() => setIsCompDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await createCompanyMutation.mutateAsync(data);
          if (created && typeof created === "object" && "id" in created) {
            setValue("company", {
              address: created?.address,
              gstin: created?.gstin,
              id: created?.id,
              name: created?.name,
              stateName: created?.stateName,
            });
          }
        }}
      />

      <PartyFormDialog
        isOpen={isPartyDialogOpen}
        onClose={() => setIsPartyDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await createPartyMutation.mutateAsync(data);
          if (created && typeof created === "object" && "id" in created) {
            setValue("party", {
              address: created?.address,
              gstin: created?.gstin,
              id: created?.id,
              name: created?.name,
              stateName: created?.stateName,
            });
          }
        }}
      />

      <ProductFormDialog
        isOpen={isProdDialogOpen}
        onClose={() => setIsProdDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await createProductMutation.mutateAsync(data);

          setValue("items", [
            ...(getValues("items") || []),
            {
              amount: 0,
              id: nanoid(5),
              per: QuantityUnit.SET,
              product: {
                id: created?.id,
                name: created?.name,
              },
              quantity: 1,
              rate: 0,
            },
          ]);
        }}
      />
    </form>
  );
};
