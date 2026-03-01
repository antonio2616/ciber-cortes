import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ciber-cortes');

constructor() {
  window.ciberDB?.init().then(r => console.log("DB init OK:", r));
  window.ciberDB?.detalleDia(new Date().toISOString().slice(0,10))
    .then(r => console.log("Detalle hoy:", r));
}
}
