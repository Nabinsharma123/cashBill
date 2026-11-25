import { ipcMain, dialog, BrowserWindow } from "electron";
import { getDrizzleDb } from "./database";
import * as schema from "./db/schema";
import { count, desc, eq, like, or } from "drizzle-orm";
import fs from "fs";

export function registerIpcHandlers() {
  const db = getDrizzleDb();

  // ==================== COMPANIES ====================
  ipcMain.handle("companies:getAll", () => {
    return db.select().from(schema.companies).orderBy(desc(schema.companies.id)).all();
  });

  ipcMain.handle("companies:create", (_, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => {
    const stateName = data.stateName || data.state_name || "";
    return db.insert(schema.companies).values({
      name: data.name,
      address: data.address,
      gstin: data.gstin,
      stateName,
    }).returning().get();
  });

  ipcMain.handle("companies:update", (_, id: number, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => {
    const stateName = data.stateName || data.state_name || "";
    return db.update(schema.companies).set({
      name: data.name,
      address: data.address,
      gstin: data.gstin,
      stateName,
    }).where(eq(schema.companies.id, id)).returning().get();
  });

  ipcMain.handle("companies:delete", (_, id: number) => {
    db.delete(schema.companies).where(eq(schema.companies.id, id)).run();
    return { success: true };
  });

  // ==================== PARTIES ====================
  ipcMain.handle("parties:getAll", () => {
    return db.select().from(schema.parties).orderBy(desc(schema.parties.id)).all();
  });

  ipcMain.handle("parties:create", (_, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => {
    const stateName = data.stateName || data.state_name || "";
    return db.insert(schema.parties).values({
      name: data.name,
      address: data.address,
      gstin: data.gstin,
      stateName,
    }).returning().get();
  });

  ipcMain.handle("parties:update", (_, id: number, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => {
    const stateName = data.stateName || data.state_name || "";
    return db.update(schema.parties).set({
      name: data.name,
      address: data.address,
      gstin: data.gstin,
      stateName,
    }).where(eq(schema.parties.id, id)).returning().get();
  });

  ipcMain.handle("parties:delete", (_, id: number) => {
    db.delete(schema.parties).where(eq(schema.parties.id, id)).run();
    return { success: true };
  });

  // ==================== PRODUCTS ====================
  ipcMain.handle("products:getAll", () => {
    return db.select().from(schema.products).orderBy(desc(schema.products.id)).all();
  });

  ipcMain.handle("products:create", (_, data: { name: string }) => {
    return db.insert(schema.products).values({
      name: data.name,
    }).returning().get();
  });

  ipcMain.handle("products:update", (_, id: number, data: { name: string }) => {
    return db.update(schema.products).set({
      name: data.name,
    }).where(eq(schema.products.id, id)).returning().get();
  });

  ipcMain.handle("products:delete", (_, id: number) => {
    db.delete(schema.products).where(eq(schema.products.id, id)).run();
    return { success: true };
  });

  // ==================== INVOICES ====================
  ipcMain.handle("invoices:getAll", (_, params?: { page?: number; limit?: number; search?: string }) => {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const offset = (page - 1) * limit;
    const search = params?.search?.trim();

    let conditions = undefined;
    if (search) {
      const searchPattern = `%${search}%`;
      conditions = or(
        like(schema.invoices.invoiceNo, searchPattern),
        like(schema.invoices.partyName, searchPattern),
        like(schema.invoices.companyName, searchPattern),
        like(schema.invoices.invoiceDate, searchPattern)
      );
    }

    // Count total matching records for pagination
    const countQuery = db
      .select({
        total: count(),
      })
      .from(schema.invoices);

    const [countResult] = conditions ? countQuery.where(conditions).all() : countQuery.all();
    const total = countResult?.total || 0;

    // Fetch page records
    const itemsQuery = db
      .select()
      .from(schema.invoices)
      .orderBy(desc(schema.invoices.id))
      .limit(limit)
      .offset(offset);

    const data = conditions ? itemsQuery.where(conditions).all() : itemsQuery.all();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  });

  ipcMain.handle("invoices:getById", (_, id: number) => {
    return db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).get() || null;
  });

  ipcMain.handle("invoices:create", (_, invoice: any) => {
    let itemsArr = invoice.items;
    if (typeof itemsArr === "string") {
      try { itemsArr = JSON.parse(itemsArr); } catch { itemsArr = []; }
    } else if (!itemsArr && invoice.items_json) {
      try { itemsArr = JSON.parse(invoice.items_json); } catch { itemsArr = []; }
    }

    let gstEntriesArr = invoice.gstEntries;
    if (typeof gstEntriesArr === "string") {
      try { gstEntriesArr = JSON.parse(gstEntriesArr); } catch { gstEntriesArr = []; }
    } else if (!gstEntriesArr && invoice.gst_entries_json) {
      try { gstEntriesArr = JSON.parse(invoice.gst_entries_json); } catch { gstEntriesArr = []; }
    }

    const newInvoice = db.insert(schema.invoices).values({
      invoiceNo: invoice.invoiceNo || invoice.invoice_no,
      invoiceTitle: invoice.invoiceTitle || invoice.invoice_title || "PROFORMA INVOICE",
      invoiceDate: invoice.invoiceDate || invoice.invoice_date,
      companyId: invoice.companyId ?? invoice.company_id ?? null,
      partyId: invoice.partyId ?? invoice.party_id ?? null,
      companyName: invoice.companyName || invoice.company_name,
      companyAddress: invoice.companyAddress || invoice.company_address,
      companyGstin: invoice.companyGstin || invoice.company_gstin,
      companyStateName: invoice.companyStateName || invoice.company_state_name,
      partyName: invoice.partyName || invoice.party_name,
      partyAddress: invoice.partyAddress || invoice.party_address,
      partyGstin: invoice.partyGstin || invoice.party_gstin,
      partyStateName: invoice.partyStateName || invoice.party_state_name,
      items: itemsArr || [],
      subtotal: Number(invoice.subtotal) || 0,
      gstEntries: gstEntriesArr || [],
      roundOff: Number(invoice.roundOff ?? invoice.round_off) || 0,
      totalAmount: Number(invoice.totalAmount ?? invoice.total_amount) || 0,
      declaration: invoice.declaration || "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    }).returning().get();

    return newInvoice;
  });

  ipcMain.handle("invoices:delete", (_, id: number) => {
    db.delete(schema.invoices).where(eq(schema.invoices.id, id)).run();
    return { success: true };
  });

  // ==================== PDF & PRINT ====================
  ipcMain.handle("invoices:exportPdf", async (event, defaultFilename: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: "Window not found" };

    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      title: "Save Invoice as PDF",
      defaultPath: defaultFilename || "Invoice.pdf",
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
          marginType: "custom",
          top: 0.3,
          bottom: 0.3,
          left: 0.3,
          right: 0.3,
        },
      });

      fs.writeFileSync(filePath, pdfData);
      return { success: true, filePath };
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("invoices:print", async (event) => {
    try {
      event.sender.print({
        silent: false,
        printBackground: true,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ==================== WINDOW CONTROLS ====================
  ipcMain.handle("window:toggleFullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const next = !win.isFullScreen();
      win.setFullScreen(next);
      return next;
    }
    return false;
  });

  ipcMain.handle("window:toggleMaximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
        return false;
      } else {
        win.maximize();
        return true;
      }
    }
    return false;
  });
}
