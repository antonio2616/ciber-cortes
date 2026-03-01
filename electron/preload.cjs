const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ciberDB", {
  init: () => ipcRenderer.invoke("db:init"),
  getCorte: (fecha) => ipcRenderer.invoke("db:getCorte", fecha),
  getLectura: (fecha) => ipcRenderer.invoke("db:getLectura", fecha),
  upsertCorte: (p) => ipcRenderer.invoke("db:upsertCorte", p),
  upsertContadores: (p) => ipcRenderer.invoke("db:upsertContadores", p),
  addGasto: (p) => ipcRenderer.invoke("db:addGasto", p),
  deleteGasto: (id) => ipcRenderer.invoke("db:deleteGasto", id),
  listGastos: (fecha) => ipcRenderer.invoke("db:listGastos", fecha),
  totalGastos: (fecha) => ipcRenderer.invoke("db:totalGastos", fecha),
  detalleDia: (fecha) => ipcRenderer.invoke("db:detalleDia", fecha),
});