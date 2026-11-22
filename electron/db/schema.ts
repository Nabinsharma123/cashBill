import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Companies Table Schema
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  gstin: text("gstin").notNull(),
  stateName: text("state_name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type CompanyDoc = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// 2. Parties Table Schema
export const parties = sqliteTable("parties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  gstin: text("gstin").notNull(),
  stateName: text("state_name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type PartyDoc = typeof parties.$inferSelect;
export type InsertParty = typeof parties.$inferInsert;

// 3. Products Table Schema
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tags: text("tags"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type ProductDoc = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// 4. Invoices Table Schema
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNo: text("invoice_no").notNull().unique(),
  invoiceTitle: text("invoice_title").default("PROFORMA INVOICE"),
  invoiceDate: text("invoice_date").notNull(),
  companyId: integer("company_id"),
  partyId: integer("party_id"),

  companyName: text("company_name").notNull(),
  companyAddress: text("company_address").notNull(),
  companyGstin: text("company_gstin").notNull(),
  companyStateName: text("company_state_name").notNull(),

  partyName: text("party_name").notNull(),
  partyAddress: text("party_address").notNull(),
  partyGstin: text("party_gstin").notNull(),
  partyStateName: text("party_state_name").notNull(),

  // Automatically JSON.parse on SELECT and JSON.stringify on INSERT
  items: text("items_json", { mode: "json" }).$type<any[]>().notNull(),
  subtotal: real("subtotal").notNull(),
  gstEntries: text("gst_entries_json", { mode: "json" }).$type<any[]>().notNull(),
  roundOff: real("round_off").default(0.0),
  totalAmount: real("total_amount").notNull(),
  totalQuantity: real("total_quantity").notNull(),
  declaration: text("declaration"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type InvoiceDoc = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
