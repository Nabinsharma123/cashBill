import type Database from "better-sqlite3";
import { count, sql } from "drizzle-orm";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { app } from "electron";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import * as schema from "./db/schema";

const require = createRequire(import.meta.url);
const DatabaseConstructor = require("better-sqlite3");

let drizzleDb: BetterSQLite3Database<typeof schema> | null = null;

function resolveDatabaseFolderPath(): string {
  if (!app.isPackaged) {
    return path.join(process.cwd(), "database");
  }

  // Windows portable (.exe) sets PORTABLE_EXECUTABLE_DIR to the folder containing the .exe
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, "database");
  }

  // Linux AppImage sets APPIMAGE to the full path of the .AppImage file
  if (process.env.APPIMAGE) {
    return path.join(path.dirname(process.env.APPIMAGE), "database");
  }

  return path.join(path.dirname(app.getPath("exe")), "database");
}

export function getDatabase() {
  if (drizzleDb) return;

  const databaseFolderPath = resolveDatabaseFolderPath();
  const databasePath = path.join(databaseFolderPath, "cashbill.db");

  if (!fs.existsSync(databaseFolderPath)) {
    fs.mkdirSync(databaseFolderPath, { recursive: true });
  }

  console.log("Opening SQLite database at:", databasePath);

  const instance: Database.Database = new DatabaseConstructor(databasePath);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");

  const db = drizzle(instance, { schema });

  initTables(db);
  seedInitialData(db);
  drizzleDb = db;
}

export function getDrizzleDb(): BetterSQLite3Database<typeof schema> {
  if (drizzleDb) return drizzleDb;
  getDatabase();
  return drizzleDb!;
}

function initTables(drizzleDb: BetterSQLite3Database<typeof schema>) {
  // 1. Companies Table
  drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      gstin TEXT NOT NULL,
      state_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Parties Table
  drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      gstin TEXT NOT NULL,
      state_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Products Table
  drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Invoices Table (Single-table storage with JSON items and GST rows)
  drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT NOT NULL UNIQUE,
      invoice_title TEXT DEFAULT 'PROFORMA INVOICE',
      invoice_date TEXT NOT NULL,
      company_id INTEGER,
      party_id INTEGER,
      
      company_name TEXT NOT NULL,
      company_address TEXT NOT NULL,
      company_gstin TEXT NOT NULL,
      company_state_name TEXT NOT NULL,
      
      party_name TEXT NOT NULL,
      party_address TEXT NOT NULL,
      party_gstin TEXT NOT NULL,
      party_state_name TEXT NOT NULL,
      
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      gst_entries_json TEXT NOT NULL,
      round_off REAL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      transport TEXT,
      declaration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData(drizzleDb: BetterSQLite3Database<typeof schema>) {
  // 1. Seed Company if empty
  const [companyRes] = drizzleDb
    .select({ total: count() })
    .from(schema.companies)
    .all();

  if (!companyRes || companyRes.total === 0) {
    drizzleDb
      .insert(schema.companies)
      .values({
        name: "Biswakarma Engg Co - 24-25",
        address: "1/1 E Road Bamungachi Howrah-05",
        gstin: "19AZPPS2562R1Z6",
        stateName: "West Bengal, Code : 19",
      })
      .run();
  }

  // 2. Seed Party if empty
  const [partyRes] = drizzleDb
    .select({ total: count() })
    .from(schema.parties)
    .all();

  if (!partyRes || partyRes.total === 0) {
    drizzleDb
      .insert(schema.parties)
      .values({
        name: "AGRAWAL TRADERS",
        address: "BUDHRAM SAH LANE NEAR GANESH MARKET\nDEOGHAR, JHAKHAND",
        gstin: "20AMIPA4645F1ZN",
        stateName: "Jharkhand, Code : 20",
      })
      .run();
  }

  // 3. Seed Products if empty
  const [productRes] = drizzleDb
    .select({ total: count() })
    .from(schema.products)
    .all();

  if (!productRes || productRes.total === 0) {
    drizzleDb
      .insert(schema.products)
      .values([
        {
          name: '8" BED JOINTER(SHREYA)',
        },
        {
          name: '10"(M) BED JOINTER (SHREYA)',
        },
        {
          name: '12"(M) BED JOINTER (SHREYA)',
        },
        {
          name: '3.5"(L)BED JOINTER(SHREYA)',
        },
      ])
      .run();
  }
}
