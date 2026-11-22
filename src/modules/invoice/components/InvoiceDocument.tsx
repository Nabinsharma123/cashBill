import React from "react";
import { TInvoiceSchema } from "../schema";
import { InvoiceTitle, QuantityUnit } from "@/constants/enums";
import { formatINR, formatDateDisplay } from "@/lib/utils";

export interface InvoiceDocumentProps {
  invoiceTitle?: string;
  invoiceNo: string;
  invoiceDate: string;
  companyName: string;
  companyAddress: string;
  companyGstin: string;
  companyState: string;
  partyName: string;
  partyAddress: string;
  partyGstin: string;
  partyState: string;
  items: TInvoiceSchema["Item"][];
  subtotal: number;
  gstEntries: TInvoiceSchema["GstEntry"][];
  roundOff: number;
  totalAmount: number;
  totalQuantity: number;
  totalQuantityUnit: QuantityUnit;
  declaration?: string;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceTitle = InvoiceTitle.PROFORMA,
  invoiceNo,
  invoiceDate,
  companyName,
  companyAddress,
  companyGstin,
  companyState,
  partyName,
  partyAddress,
  partyGstin,
  partyState,
  items,
  subtotal,
  gstEntries,
  roundOff,
  totalAmount,
  totalQuantity,
  totalQuantityUnit,
  declaration = "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
}) => {
  return (
    <div className="invoice-document-root bg-white text-black font-sans leading-tight text-[13px] max-w-[800px] mx-auto p-4 select-none">
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
                <span className="font-semibold">GSTIN/UIN:</span> {companyGstin}
              </div>
              <div>
                <span className="font-semibold">State Name :</span> {companyState}
              </div>
            </div>
          </div>

          {/* Invoice No. & Date */}
          <div className="w-[42%] flex flex-col">
            <div className="flex border-b border-black h-1/2">
              <div className="w-1/2 p-2 border-r border-black">
                <div className="text-[11px] text-gray-600">Invoice No.</div>
                <div className="font-bold text-[13px] mt-0.5">{invoiceNo}</div>
              </div>
              <div className="w-1/2 p-2">
                <div className="text-[11px] text-gray-600">Dated</div>
                <div className="font-semibold text-[13px] mt-0.5">
                  {formatDateDisplay(invoiceDate)}
                </div>
              </div>
            </div>
            <div className="p-2 h-1/2 text-[11px] text-gray-400">
              {/* Reference section matching standard GST bill layout */}
            </div>
          </div>
        </div>

        {/* Buyer (Bill to) Section */}
        <div className="border-b border-black p-2.5 min-h-[90px]">
          <div className="text-[11px] text-gray-700 font-medium">Buyer (Bill to)</div>
          <div className="font-bold text-[14px] uppercase text-black mt-0.5">
            {partyName || "BUYER NAME"}
          </div>
          <div className="whitespace-pre-line text-[12px] text-gray-800 mt-0.5">
            {partyAddress}
          </div>
          <div className="mt-2 text-[12.5px] flex flex-col gap-0.5">
            <div>
              <span className="font-semibold inline-block w-28">GSTIN/UIN</span>:{" "}
              <span className="font-medium">{partyGstin}</span>
            </div>
            <div>
              <span className="font-semibold inline-block w-28">State Name</span>:{" "}
              <span className="font-medium">{partyState}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-center font-semibold bg-gray-50/50">
                <th className="border-r border-black py-1.5 px-1 w-[6%] font-semibold">
                  Sl<br />No.
                </th>
                <th className="border-r border-black py-1.5 px-2 text-left w-[44%] font-semibold">
                  Description of Goods
                </th>
                <th className="border-r border-black py-1.5 px-1 w-[2%]"></th>
                <th className="border-r border-black py-1.5 px-2 text-right w-[12%] font-semibold">
                  Quantity
                </th>
                <th className="border-r border-black py-1.5 px-2 text-right w-[12%] font-semibold">
                  Rate
                </th>
                <th className="border-r border-black py-1.5 px-2 text-center w-[8%] font-semibold">
                  per
                </th>
                <th className="py-1.5 px-2 text-right w-[16%] font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="align-top">
                  <td className="border-r border-black py-1 px-1 text-center font-normal">
                    {item.slNo ?? (item as any).sl_no ?? idx + 1}
                  </td>
                  <td className="border-r border-black py-1 px-2 font-bold text-left uppercase">
                    {item.description}
                  </td>
                  <td className="border-r border-black py-1 px-1"></td>
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

              {/* Natural spacing rows */}
              {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                <tr key={"spacer-" + i} className="h-6">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              ))}

              {/* Subtotal line */}
              <tr className="border-t border-black/40">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="py-1 px-2 text-right font-semibold border-b border-black/30">
                  {formatINR(subtotal)}
                </td>
              </tr>

              {/* Dynamic GST Tax Rows */}
              {gstEntries.map((gst) => (
                <tr key={gst.id} className="text-[12px]">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black py-0.5 px-2 text-right font-bold italic">
                    {gst.type} {gst.rate}%
                  </td>
                  <td className="border-r border-black"></td>
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
                <td className="border-r border-black"></td>
                <td className="py-0.5 px-2 text-right font-semibold">
                  {Number(roundOff) >= 0 ? Number(roundOff).toFixed(2) : `(${Math.abs(Number(roundOff)).toFixed(2)})`}
                </td>
              </tr>

              {/* Grand Total Row */}
              <tr className="border-t border-b border-black font-bold text-[13px] bg-gray-50/30">
                <td className="border-r border-black py-1.5 px-1 text-center"></td>
                <td className="border-r border-black py-1.5 px-2 text-right">
                  Total
                </td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black py-1.5 px-2 text-right font-bold">
                  {Number(totalQuantity).toFixed(2)} {totalQuantityUnit}
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
