import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CiberDbService, FechaISO } from '../../services/ciber-db';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

function hoyISO(): FechaISO {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}` as FechaISO;
}

@Component({
  selector: 'app-captura',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDividerModule
  ],
  templateUrl: './captura.html',
  styleUrl: './captura.scss'
})
export class CapturaComponent {
  fecha = signal<FechaISO>(hoyISO());

  // Ingresos manuales
  recargas = signal('0');
  ciber = signal('0');
  rfc = signal('0');
  actas = signal('0');
  color_variable = signal('0');
  otros = signal('0');

  // Lecturas
  lect_copia_kyocera = signal('0');
  lect_imp_kyocera = signal('0');
  lect_imp_brother = signal('0');

  // Caja
  retiro_caja = signal('0');
  caja_inicial = signal('0');
  caja_real = signal('0');

  notas = signal('');

  saving = signal(false);

  constructor(private db: CiberDbService, private router: Router) {}

  async cargar() {
    const f = this.fecha();
    const corte = await this.db.getCorte(f);
    const lect = await this.db.getLectura(f);

    if (corte) {
      this.recargas.set(String(corte.recargas ?? 0));
      this.ciber.set(String(corte.ciber ?? 0));
      this.rfc.set(String(corte.rfc ?? 0));
      this.actas.set(String(corte.actas ?? 0));
      this.color_variable.set(String(corte.color_variable ?? 0));
      this.otros.set(String(corte.otros ?? 0));
      this.retiro_caja.set(String(corte.retiro_caja ?? 0));
      this.caja_inicial.set(String(corte.caja_inicial ?? 0));
      this.caja_real.set(String(corte.caja_real ?? 0));
      this.notas.set(String(corte.notas ?? ''));
    } else {
      this.recargas.set('0'); this.ciber.set('0'); this.rfc.set('0'); this.actas.set('0');
      this.color_variable.set('0'); this.otros.set('0');
      this.retiro_caja.set('0'); this.caja_inicial.set('0'); this.caja_real.set('0');
      this.notas.set('');
    }

    if (lect) {
      this.lect_copia_kyocera.set(String(lect.lect_copia_kyocera ?? lect.lect_copia_kyocera ?? 0));
      this.lect_imp_kyocera.set(String(lect.lect_imp_kyocera ?? 0));
      this.lect_imp_brother.set(String(lect.lect_imp_brother ?? 0));
    } else {
      this.lect_copia_kyocera.set('0'); this.lect_imp_kyocera.set('0'); this.lect_imp_brother.set('0');
    }
  }

  private fnum(s: string): number {
    return Number(String(s ?? '0').replace(/,/g, '').trim() || '0');
  }

  async guardar() {
    this.saving.set(true);
    try {
      const fecha = this.fecha();

      await this.db.upsertCorte({
        fecha,
        recargas: this.fnum(this.recargas()),
        ciber: this.fnum(this.ciber()),
        rfc: this.fnum(this.rfc()),
        actas: this.fnum(this.actas()),
        color_variable: this.fnum(this.color_variable()),
        otros: this.fnum(this.otros()),
        retiro_caja: this.fnum(this.retiro_caja()),
        caja_inicial: this.fnum(this.caja_inicial()),
        caja_real: this.fnum(this.caja_real()),
        notas: this.notas()
      });

      await this.db.upsertContadores({
        fecha,
        lect_copia_kyocera: this.fnum(this.lect_copia_kyocera()),
        lect_imp_kyocera: this.fnum(this.lect_imp_kyocera()),
        lect_imp_brother: this.fnum(this.lect_imp_brother()),
        notas: ''
      });

      // opcional: recargar
      await this.cargar();
    } finally {
      this.saving.set(false);
    }
  }

  irDesglose() {
    this.router.navigate(['/desglose'], { queryParams: { fecha: this.fecha() } });
  }

  ngOnInit() {
    this.cargar();
  }
}