import { InvoiceTitle } from "@/constants/enums";
import { formatDateDisplay, formatINR } from "@/lib/utils";
import React from "react";
import { TInvoiceSchema } from "../schema";

export const InvoiceDocument: React.FC<{
  invoice?: TInvoiceSchema["Preview"] | null;
}> = ({ invoice }) => {
  if (!invoice) return null;

  const invoiceTitle = invoice.invoiceTitle || InvoiceTitle.PROFORMA;
  const invoiceNo = invoice.invoiceNo || "";
  const invoiceDate = invoice.invoiceDate || "";

  const companyName = invoice.company?.name || "";
  const companyAddress = invoice.company?.address || "";
  const companyGstin = invoice.company?.gstin || "";
  const companyState = invoice.company?.stateName || "";

  const partyName = invoice.party?.name || "";
  const partyAddress = invoice.party?.address || "";
  const partyGstin = invoice.party?.gstin || "";
  const partyState = invoice.party?.stateName || "";

  const items = invoice.items || [];
  const gstEntries = invoice.gstEntries || [];
  const subtotal = Number(invoice.subtotal) || 0;
  const roundOff = Number(invoice.roundOff) || 0;
  const totalAmount = Number(invoice.totalAmount) || 0;
  const declaration =
    invoice.declaration ||
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";

  const MIN_TABLE_ROWS = 8;
  const emptyRowCount = Math.max(0, MIN_TABLE_ROWS - items.length);
  const computedTotalQuantity = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0),
    0,
  );

  return (
    <div className="invoice-document-root bg-white text-black font-sans leading-tight text-[13px] w-full max-w-[800px] mx-auto p-4 select-none print:p-0 print:max-w-none">
      {/* Title */}
      <div className="text-center font-bold text-base tracking-wide uppercase py-2">
        {invoiceTitle}
      </div>

      {/* Main Border Box */}
      <div className="border border-black flex flex-col">
        {/* Top Section: Company (Left) and Invoice No / Date (Right) */}
        <div className="flex border-b border-black">
          {/* Company Details */}
          <div className="w-[58%] p-2.5 border-r border-black flex flex-col justify-between">
            <div>
              <div className="font-bold text-[14px] text-black uppercase">
                {companyName || "COMPANY NAME"}
              </div>
              <div className="whitespace-pre-line text-[12px] text-gray-800 mt-0.5">
                {companyAddress}
              </div>
            </div>
            <div className="mt-2 text-[12.5px] space-y-0.5">
              <div>
                <span className="font-semibold inline-block w-24">
                  GSTIN/UIN
                </span>
                : <span className="font-medium">{companyGstin}</span>
              </div>
              <div>
                <span className="font-semibold inline-block w-24">
                  State Name
                </span>
                : <span className="font-medium">{companyState}</span>
              </div>
            </div>
          </div>

          {/* Invoice No. & Date */}
          <div className="w-[42%] flex flex-col justify-between">
            <div className="flex h-full">
              <div className="w-1/2 p-2.5 border-r border-black flex flex-col">
                <div className="text-[11px] text-gray-600 font-medium">
                  Invoice No.
                </div>
                <div className="font-bold text-[13px] mt-1 text-black">
                  {invoiceNo}
                </div>
              </div>
              <div className="w-1/2 p-2.5 flex flex-col">
                <div className="text-[11px] text-gray-600 font-medium">
                  Dated
                </div>
                <div className="font-semibold text-[13px] mt-1 text-black">
                  {formatDateDisplay(invoiceDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer (Bill to) Section */}
        <div className="border-b border-black p-2.5 min-h-[90px]">
          <div className="text-[11px] text-gray-700 font-medium">
            Buyer (Bill to)
          </div>
          <div className="font-bold text-[14px] uppercase text-black mt-0.5">
            {partyName || "BUYER NAME"}
          </div>
          <div className="whitespace-pre-line text-[12px] text-gray-800 mt-0.5">
            {partyAddress}
          </div>
          <div className="mt-2 text-[12.5px] flex flex-col gap-0.5">
            <div>
              <span className="font-semibold inline-block w-24">GSTIN/UIN</span>
              : <span className="font-medium">{partyGstin}</span>
            </div>
            <div>
              <span className="font-semibold inline-block w-24">
                State Name
              </span>
              : <span className="font-medium">{partyState}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-center font-semibold bg-gray-50/50">
                <th className="border-r border-black py-1.5 px-1 w-[6%] font-semibold">
                  Sl
                  <br />
                  No.
                </th>
                <th className="border-r border-black py-1.5 px-2 text-left w-[48%] font-semibold">
                  Description of Goods
                </th>
                <th className="border-r border-black py-1.5 px-2 text-right w-[12%] font-semibold">
                  Quantity
                </th>
                <th className="border-r border-black py-1.5 px-2 text-right w-[12%] font-semibold">
                  Rate
                </th>
                <th className="border-r border-black py-1.5 px-2 text-center w-[8%] font-semibold">
                  per
                </th>
                <th className="py-1.5 px-2 text-right w-[14%] font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="align-top">
                  <td className="border-r border-black py-1 px-1 text-center font-normal">
                    {idx + 1}
                  </td>
                  <td className="border-r border-black py-1 px-2 font-bold text-left uppercase">
                    {item.product?.name}
                  </td>
                  <td className="border-r border-black py-1 px-2 text-right font-medium">
                    {Number(item.quantity).toFixed(2)}
                  </td>
                  <td className="border-r border-black py-1 px-2 text-right font-medium">
                    {Number(item.rate).toFixed(2)}
                  </td>
                  <td className="border-r border-black py-1 px-2 text-center font-medium uppercase">
                    {item.per || "SETS"}
                  </td>
                  <td className="py-1 px-2 text-right font-semibold">
                    {formatINR(Number(item.amount))}
                  </td>
                </tr>
              ))}

              {/* Natural spacing rows to preserve tall columnar structure */}
              {Array.from({ length: emptyRowCount }).map((_, i) => (
                <tr key={"spacer-" + i} className="h-7">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              ))}

              {/* Subtotal line (rendered when items exist) */}
              {items.length > 0 && (
                <tr className="text-[12px]">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black py-0.5 px-2 text-right font-medium text-gray-700"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="py-0.5 px-2 text-right font-semibold border-t border-black/40">
                    {formatINR(subtotal)}
                  </td>
                </tr>
              )}

              {/* Dynamic GST Tax Rows */}
              {gstEntries.map((gst) => (
                <tr key={gst.id} className="text-[12px]">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black py-0.5 px-2 text-right font-bold italic">
                    {gst.type} {gst.rate}%
                  </td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black py-0.5 px-2 text-right font-medium">
                    {gst.rate} %
                  </td>
                  <td className="border-r border-black"></td>
                  <td className="py-0.5 px-2 text-right font-semibold">
                    {formatINR(gst.amount)}
                  </td>
                </tr>
              ))}

              {/* Round Off Row */}
              <tr className="text-[12px]">
                <td className="border-r border-black"></td>
                <td className="border-r border-black py-0.5 px-2 text-right font-bold italic">
                  ROUND OFF
                </td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="py-0.5 px-2 text-right font-semibold">
                  {Number(roundOff) >= 0
                    ? Number(roundOff).toFixed(2)
                    : `(${Math.abs(Number(roundOff)).toFixed(2)})`}
                </td>
              </tr>

              {/* Grand Total Row */}
              <tr className="border-t border-b border-black font-bold text-[13px] bg-gray-50/30">
                <td className="border-r border-black py-1.5 px-1 text-center"></td>
                <td className="border-r border-black py-1.5 px-2 text-right">
                  Total
                </td>
                <td className="border-r border-black py-1.5 px-2 text-right font-bold">
                  {Number(computedTotalQuantity).toFixed(2)}
                </td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="py-1.5 px-2 text-right font-extrabold text-[14px]">
                  ₹ {formatINR(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Declaration and Signatory Bottom Box */}
        <div className="flex min-h-[105px]">
          {/* Declaration */}
          <div className="w-[55%] p-2.5 border-r border-black flex flex-col justify-between">
            <div>
              <div className="text-[11px] underline font-semibold text-gray-800">
                Declaration
              </div>
              <p className="text-[11.5px] text-gray-800 mt-1 leading-normal">
                {declaration}
              </p>
            </div>
          </div>

          {/* Authorised Signatory */}
          <div className="w-[45%] p-2.5 flex flex-col justify-between text-right">
            <div className="font-bold text-[12.5px] uppercase">
              for {companyName || "COMPANY NAME"}
            </div>
            <div className="font-semibold text-[12px] text-gray-900 pb-1">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="text-center text-[11px] text-gray-700 mt-2 font-medium">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
};
