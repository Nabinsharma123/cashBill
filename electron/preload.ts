import { contextBridge, ipcRenderer } from "electron";

export const electronAPI = {
  // Companies
  getCompanies: () => ipcRenderer.invoke("companies:getAll"),
  createCompany: (data: any) => ipcRenderer.invoke("companies:create", data),
  updateCompany: (id: number, data: any) =>
    ipcRenderer.invoke("companies:update", id, data),
  deleteCompany: (id: number) => ipcRenderer.invoke("companies:delete", id),

  // Parties
  getParties: () => ipcRenderer.invoke("parties:getAll"),
  createParty: (data: any) => ipcRenderer.invoke("parties:create", data),
  updateParty: (id: number, data: any) =>
    ipcRenderer.invoke("parties:update", id, data),
  deleteParty: (id: number) => ipcRenderer.invoke("parties:delete", id),

  // Products
  getProducts: () => ipcRenderer.invoke("products:getAll"),
  createProduct: (data: any) => ipcRenderer.invoke("products:create", data),
  updateProduct: (id: number, data: any) =>
    ipcRenderer.invoke("products:update", id, data),
  deleteProduct: (id: number) => ipcRenderer.invoke("products:delete", id),

  // Invoices
  getInvoices: (params?: { page?: number; limit?: number; search?: string }) =>
    ipcRenderer.invoke("invoices:getAll", params),
  getInvoiceById: (id: number) => ipcRenderer.invoke("invoices:getById", id),
  createInvoice: (data: any) => ipcRenderer.invoke("invoices:create", data),
  deleteInvoice: (id: number) => ipcRenderer.invoke("invoices:delete", id),

  // Native PDF & Print
  exportPdf: (defaultFilename: string) =>
    ipcRenderer.invoke("invoices:exportPdf", defaultFilename),
  printInvoice: () => ipcRenderer.invoke("invoices:print"),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
