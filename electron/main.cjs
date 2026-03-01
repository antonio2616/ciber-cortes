const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { createDbApi, DB_NAME } = require("./sqlite-api.cjs");

let api;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("http://localhost:4200");
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath("userData"), DB_NAME);
  api = createDbApi({ dbPath });
  api.init_db_and_migrate();

  ipcMain.handle("db:init", () => api.init_db_and_migrate());
  ipcMain.handle("db:getCorte", (_, fecha) => api.get_corte(fecha));
  ipcMain.handle("db:getLectura", (_, fecha) => api.get_lectura(fecha));
  ipcMain.handle("db:upsertCorte", (_, p) => api.upsert_corte(p));
  ipcMain.handle("db:upsertContadores", (_, p) => api.upsert_contadores(p));
  ipcMain.handle("db:addGasto", (_, p) => api.add_gasto(p));
  ipcMain.handle("db:deleteGasto", (_, id) => api.delete_gasto(id));
  ipcMain.handle("db:listGastos", (_, fecha) => api.list_gastos(fecha));
  ipcMain.handle("db:totalGastos", (_, fecha) => api.total_gastos(fecha));
  ipcMain.handle("db:detalleDia", (_, fecha) => api.detalle_dia(fecha));

  createWindow();
});