export {};

declare global {
  interface Window {
    ciberDB?: {
      init: () => Promise<any>;
      detalleDia: (fecha: string) => Promise<any>;
      getCorte: (fecha: string) => Promise<any>;
      getLectura: (fecha: string) => Promise<any>;
      upsertCorte: (p: any) => Promise<any>;
      upsertContadores: (p: any) => Promise<any>;
      addGasto: (p: any) => Promise<any>;
      deleteGasto: (id: number) => Promise<any>;
      listGastos: (fecha: string) => Promise<any[]>;
      totalGastos: (fecha: string) => Promise<number>;
    };
  }
}