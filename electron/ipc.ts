import { count, desc, eq, or, sql } from "drizzle-orm";
import { BrowserWindow, dialog, ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";
import { getDrizzleDb } from "./database";
import * as schema from "./db/schema";

function toFiniteNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function registerIpcHandlers() {
  const db = getDrizzleDb();

  // ==================== COMPANIES ====================
  ipcMain.handle("companies:getAll", () => {
    return db
      .select()
      .from(schema.companies)
      .orderBy(desc(schema.companies.id))
      .all();
  });

  ipcMain.handle(
    "companies:create",
    (
      _,
      data: { name: string; address: string; gstin: string; stateName: string },
    ) => {
      return db
        .insert(schema.companies)
        .values({
          name: data.name,
          address: data.address,
          gstin: data.gstin,
          stateName: data.stateName,
        })
        .returning()
        .get();
    },
  );

  ipcMain.handle(
    "companies:update",
    (
      _,
      id: number,
      data: { name: string; address: string; gstin: string; stateName: string },
    ) => {
      const updated = db
        .update(schema.companies)
        .set({
          name: data.name,
          address: data.address,
          gstin: data.gstin,
          stateName: data.stateName,
        })
        .where(eq(schema.companies.id, id))
        .returning()
        .get();

      if (!updated) {
        throw new Error("Company not found");
      }
      return updated;
    },
  );

  ipcMain.handle("companies:delete", (_, id: number) => {
    const result = db
      .delete(schema.companies)
      .where(eq(schema.companies.id, id))
      .run();
    return { success: result.changes > 0 };
  });

  // ==================== PARTIES ====================
  ipcMain.handle("parties:getAll", () => {
    return db
      .select()
      .from(schema.parties)
      .orderBy(desc(schema.parties.id))
      .all();
  });

  ipcMain.handle(
    "parties:create",
    (
      _,
      data: { name: string; address: string; gstin: string; stateName: string },
    ) => {
      return db
        .insert(schema.parties)
        .values({
          name: data.name,
          address: data.address,
          gstin: data.gstin,
          stateName: data.stateName,
        })
        .returning()
        .get();
    },
  );

  ipcMain.handle(
    "parties:update",
    (
      _,
      id: number,
      data: { name: string; address: string; gstin: string; stateName: string },
    ) => {
      const updated = db
        .update(schema.parties)
        .set({
          name: data.name,
          address: data.address,
          gstin: data.gstin,
          stateName: data.stateName,
        })
        .where(eq(schema.parties.id, id))
        .returning()
        .get();

      if (!updated) {
        throw new Error("Party not found");
      }
      return updated;
    },
  );

  ipcMain.handle("parties:delete", (_, id: number) => {
    const result = db
      .delete(schema.parties)
      .where(eq(schema.parties.id, id))
      .run();
    return { success: result.changes > 0 };
  });

  // ==================== PRODUCTS ====================
  ipcMain.handle("products:getAll", () => {
    return db
      .select()
      .from(schema.products)
      .orderBy(desc(schema.products.id))
      .all();
  });

  ipcMain.handle("products:create", (_, data: { name: string }) => {
    return db
      .insert(schema.products)
      .values({
        name: data.name,
      })
      .returning()
      .get();
  });

  ipcMain.handle("products:update", (_, id: number, data: { name: string }) => {
    const updated = db
      .update(schema.products)
      .set({
        name: data.name,
      })
      .where(eq(schema.products.id, id))
      .returning()
      .get();

    if (!updated) {
      throw new Error("Product not found");
    }
    return updated;
  });

  ipcMain.handle("products:delete", (_, id: number) => {
    const result = db
      .delete(schema.products)
      .where(eq(schema.products.id, id))
      .run();
    return { success: result.changes > 0 };
  });

  // ==================== INVOICES ====================
  ipcMain.handle(
    "invoices:getAll",
    (_, params?: { page?: number; limit?: number; search?: string }) => {
      const requestedPage = Math.max(1, Math.floor(Number(params?.page) || 1));
      const limit = Math.max(1, Math.floor(Number(params?.limit) || 10));
      const search = params?.search?.trim();

      let conditions = undefined;
      if (search) {
        const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
        const searchPattern = `%${escapedSearch}%`;
        conditions = or(
          sql`${schema.invoices.invoiceNo} LIKE ${searchPattern} ESCAPE '\\'`,
          sql`${schema.invoices.partyName} LIKE ${searchPattern} ESCAPE '\\'`,
          sql`${schema.invoices.companyName} LIKE ${searchPattern} ESCAPE '\\'`,
          sql`${schema.invoices.invoiceDate} LIKE ${searchPattern} ESCAPE '\\'`,
        );
      }

      // Count total matching records for pagination
      const countQuery = db
        .select({
          total: count(),
        })
        .from(schema.invoices);

      const [countResult] = conditions
        ? countQuery.where(conditions).all()
        : countQuery.all();
      const total = countResult?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const page = Math.min(requestedPage, totalPages);
      const offset = (page - 1) * limit;

      // Fetch page records
      const itemsQuery = db
        .select()
        .from(schema.invoices)
        .orderBy(desc(schema.invoices.id))
        .limit(limit)
        .offset(offset);

      const data = conditions
        ? itemsQuery.where(conditions).all()
        : itemsQuery.all();

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    },
  );

  ipcMain.handle("invoices:getById", (_, id: number) => {
    return (
      db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, id))
        .get() || null
    );
  });

  ipcMain.handle("invoices:create", (_, invoice: schema.InsertInvoice) => {
    try {
      return db
        .insert(schema.invoices)
        .values({
          invoiceNo: invoice.invoiceNo,
          invoiceTitle: invoice.invoiceTitle,
          invoiceDate: invoice.invoiceDate,
          companyId: invoice.companyId ?? null,
          partyId: invoice.partyId ?? null,
          companyName: invoice.companyName,
          companyAddress: invoice.companyAddress,
          companyGstin: invoice.companyGstin,
          companyStateName: invoice.companyStateName,
          partyName: invoice.partyName,
          partyAddress: invoice.partyAddress,
          partyGstin: invoice.partyGstin,
          partyStateName: invoice.partyStateName,
          items: Array.isArray(invoice.items) ? invoice.items : [],
          subtotal: toFiniteNumber(invoice.subtotal),
          gstEntries: Array.isArray(invoice.gstEntries)
            ? invoice.gstEntries
            : [],
          roundOff: toFiniteNumber(invoice.roundOff),
          totalAmount: toFiniteNumber(invoice.totalAmount),
          transport: invoice.transport ?? "",
          declaration: invoice.declaration ?? "",
        })
        .returning()
        .get();
    } catch (err: any) {
      if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new Error(
          `Invoice number "${invoice.invoiceNo}" already exists.`,
        );
      }
      throw err;
    }
  });

  ipcMain.handle("invoices:delete", (_, id: number) => {
    const result = db
      .delete(schema.invoices)
      .where(eq(schema.invoices.id, id))
      .run();
    return { success: result.changes > 0 };
  });

  // ==================== PDF & PRINT ====================
  ipcMain.handle(
    "invoices:exportPdf",
    async (event, defaultFilename: string) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return { success: false, error: "Window not found" };

      const safeFilename =
        path
          .basename(defaultFilename || "Invoice.pdf")
          .replace(/[<>:"/\\|?*]/g, "_") || "Invoice.pdf";

      const { filePath, canceled } = await dialog.showSaveDialog(win, {
        title: "Save Invoice as PDF",
        defaultPath: safeFilename,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }],
      });

      if (canceled || !filePath) {
        return { success: false, canceled: true };
      }

      try {
        const pdfData = await event.sender.printToPDF({
          printBackground: true,
          pageSize: "A4",
          margins: {
            top: 0.3,
            bottom: 0.3,
            left: 0.3,
            right: 0.3,
          },
        });

        await fs.promises.writeFile(filePath, pdfData);
        return { success: true, filePath };
      } catch (err: any) {
        console.error("PDF generation failed:", err);
        return { success: false, error: err?.message || String(err) };
      }
    },
  );

  ipcMain.handle("invoices:print", async (event) => {
    const printers = await event.sender.getPrintersAsync();
    if (!printers || printers.length === 0) {
      return {
        success: false,
        noPrinters: true,
        error: "No printer found on this system",
      };
    }

    return new Promise<{
      success: boolean;
      canceled?: boolean;
      noPrinters?: boolean;
      error?: string;
    }>((resolve) => {
      event.sender.print(
        {
          silent: false,
          printBackground: true,
          usePrinterDefaultPageSize: true,
        },
        (success, failureReason) => {
          if (success) {
            resolve({ success: true });
          } else if (failureReason?.toLowerCase().includes("cancel")) {
            resolve({ success: false, canceled: true });
          } else {
            resolve({
              success: false,
              error: failureReason || "Unable to open print dialog.",
            });
          }
        },
      );
    });
  });
}
