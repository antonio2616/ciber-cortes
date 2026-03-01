import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CiberDbService, FechaISO } from '../../services/ciber-db';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-desglose',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './desglose.html',
  styleUrl: './desglose.scss'
})
export class DesgloseComponent {
  fecha = signal<FechaISO>(new Date().toISOString().slice(0, 10) as FechaISO);
  info = signal<any>(null);

  constructor(private route: ActivatedRoute, private db: CiberDbService) {}

  async cargar() {
    this.info.set(await this.db.detalleDia(this.fecha()));
  }

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap.get('fecha');
    if (qp) this.fecha.set(qp as FechaISO);
    this.cargar();
  }
}