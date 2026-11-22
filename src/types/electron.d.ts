export interface ElectronAPI {
  // Companies
  getCompanies: () => Promise<any[]>;
  createCompany: (data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => Promise<any>;
  updateCompany: (id: number, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => Promise<any>;
  deleteCompany: (id: number) => Promise<{ success: boolean }>;

  // Parties
  getParties: () => Promise<any[]>;
  createParty: (data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => Promise<any>;
  updateParty: (id: number, data: { name: string; address: string; gstin: string; stateName?: string; state_name?: string }) => Promise<any>;
  deleteParty: (id: number) => Promise<{ success: boolean }>;

  // Products
  getProducts: () => Promise<any[]>;
  createProduct: (data: { name: string; tags?: string }) => Promise<any>;
  updateProduct: (id: number, data: { name: string; tags?: string }) => Promise<any>;
  deleteProduct: (id: number) => Promise<{ success: boolean }>;

  // Invoices
  getInvoices: () => Promise<any[]>;
  getInvoiceById: (id: number) => Promise<any>;
  createInvoice: (data: any) => Promise<any>;
  deleteInvoice: (id: number) => Promise<{ success: boolean }>;

  // Native PDF & Print
  exportPdf: (defaultFilename: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  printInvoice: () => Promise<{ success: boolean; error?: string }>;

  // Window Controls
  toggleFullscreen: () => Promise<boolean>;
  toggleMaximize: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
