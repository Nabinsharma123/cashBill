import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDatabase } from "./database";
import { registerIpcHandlers } from "./ipc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..");
export const MAIN_DIST = path.join(appRoot, "dist-electron");
export const RENDERER_DIST = path.join(appRoot, "dist");

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(appRoot, "public")
  : RENDERER_DIST;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Biswakarma Engg",
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.webContents.on(
    "preload-error",
    (_event, preloadErrPath, error) => {
      console.error(
        "CRITICAL: Failed to load preload script:",
        preloadErrPath,
        error,
      );
    },
  );

  // Enable F11 keyboard shortcut to toggle fullscreen
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F11" && input.type === "keyDown") {
      if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      }
      event.preventDefault();
    }
  });

  // Automatically maximize window on launch to fill the screen
  mainWindow.maximize();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open DevTools in dev mode
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize Database
  getDatabase();

  // Register IPC Handlers
  registerIpcHandlers();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
