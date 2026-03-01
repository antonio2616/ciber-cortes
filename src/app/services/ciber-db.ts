import { Injectable } from '@angular/core';

export type FechaISO = `${number}-${number}-${number}`;

@Injectable({ providedIn: 'root' })
export class CiberDbService {
  init() { return window.ciberDB!.init(); }

  getCorte(fecha: FechaISO) { return window.ciberDB!.getCorte(fecha); }
  getLectura(fecha: FechaISO) { return window.ciberDB!.getLectura(fecha); }

  upsertCorte(payload: any) { return window.ciberDB!.upsertCorte(payload); }
  upsertContadores(payload: any) { return window.ciberDB!.upsertContadores(payload); }

  addGasto(payload: any) { return window.ciberDB!.addGasto(payload); }
  deleteGasto(id: number) { return window.ciberDB!.deleteGasto(id); }
  listGastos(fecha: FechaISO) { return window.ciberDB!.listGastos(fecha); }
  totalGastos(fecha: FechaISO) { return window.ciberDB!.totalGastos(fecha); }

  detalleDia(fecha: FechaISO) { return window.ciberDB!.detalleDia(fecha); }
}