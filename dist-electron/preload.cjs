"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const electronAPI = {
  // Companies
  getCompanies: () => electron.ipcRenderer.invoke("companies:getAll"),
  createCompany: (data) => electron.ipcRenderer.invoke("companies:create", data),
  updateCompany: (id, data) => electron.ipcRenderer.invoke("companies:update", id, data),
  deleteCompany: (id) => electron.ipcRenderer.invoke("companies:delete", id),
  // Parties
  getParties: () => electron.ipcRenderer.invoke("parties:getAll"),
  createParty: (data) => electron.ipcRenderer.invoke("parties:create", data),
  updateParty: (id, data) => electron.ipcRenderer.invoke("parties:update", id, data),
  deleteParty: (id) => electron.ipcRenderer.invoke("parties:delete", id),
  // Products
  getProducts: () => electron.ipcRenderer.invoke("products:getAll"),
  createProduct: (data) => electron.ipcRenderer.invoke("products:create", data),
  updateProduct: (id, data) => electron.ipcRenderer.invoke("products:update", id, data),
  deleteProduct: (id) => electron.ipcRenderer.invoke("products:delete", id),
  // Invoices
  getInvoices: () => electron.ipcRenderer.invoke("invoices:getAll"),
  getInvoiceById: (id) => electron.ipcRenderer.invoke("invoices:getById", id),
  createInvoice: (data) => electron.ipcRenderer.invoke("invoices:create", data),
  deleteInvoice: (id) => electron.ipcRenderer.invoke("invoices:delete", id),
  // Native PDF & Print
  exportPdf: (defaultFilename) => electron.ipcRenderer.invoke("invoices:exportPdf", defaultFilename),
  printInvoice: () => electron.ipcRenderer.invoke("invoices:print"),
  // Window Controls
  toggleFullscreen: () => electron.ipcRenderer.invoke("window:toggleFullscreen"),
  toggleMaximize: () => electron.ipcRenderer.invoke("window:toggleMaximize")
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
exports.electronAPI = electronAPI;
